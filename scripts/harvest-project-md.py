#!/usr/bin/env python3
"""Extract case study frontmatter + markdown body from Assets/pages/project__*.html."""

from __future__ import annotations

import re
import sys
from html import unescape
from pathlib import Path

ASSETS = Path(__file__).resolve().parents[2] / "Assets" / "pages"

THEME_BY_SLUG = {
    "unicef-hope": "hope",
    "united-nations-partner-portal": "unpp",
    "solar-asset-management-platform": "vermillion",
    "regional-finance-loans": "regional",
}


def strip_tags(html: str) -> str:
    return unescape(re.sub(r"<[^>]+>", "", html)).strip()


def inline_md(html: str) -> str:
    html = re.sub(r"<strong>(.*?)</strong>", r"**\1**", html, flags=re.DOTALL)
    html = re.sub(r"<em>(.*?)</em>", r"*\1*", html, flags=re.DOTALL)
    return strip_tags(html)


def html_to_md(html: str) -> str:
    html = html.strip()
    html = re.sub(r"<br\s*/?>", "\n", html)
    html = re.sub(r"<p>\s*(?:\u200d|‍|\s)*\s*</p>", "", html)

    parts: list[str] = []
    pattern = re.compile(
        r"(<h[245]>.*?</h[245]>|<p>.*?</p>|<blockquote>.*?</blockquote>|<ul.*?>.*?</ul>)",
        re.DOTALL,
    )

    for tok in pattern.findall(html):
        tok = tok.strip()
        if not tok:
            continue
        if tok.startswith("<h2>"):
            parts.append("## " + strip_tags(tok))
        elif tok.startswith("<h4>"):
            parts.append("#### " + strip_tags(tok))
        elif tok.startswith("<h5>"):
            parts.append("##### " + inline_md(tok))
        elif tok.startswith("<p>"):
            text = inline_md(tok)
            if text:
                parts.append(text)
        elif tok.startswith("<blockquote>"):
            inner = re.sub(r"<br\s*/?>", "\n", tok)
            inner = re.sub(r"</?blockquote>", "", inner)
            inner = re.sub(r"<[^>]+>", "", inner)
            lines = [l.strip() for l in unescape(inner).split("\n") if l.strip()]
            parts.append("\n".join(f"> {l}" for l in lines))
        elif tok.startswith("<ul"):
            items = re.findall(r"<li>(.*?)</li>", tok, re.DOTALL)
            parts.append("\n".join(f"- {inline_md(item)}" for item in items))

    return "\n\n".join(parts)


def extract_body(html: str) -> str:
    rich1 = re.search(
        r'<div class="rich-text-block w-richtext">(.*?)</div>\s*<div class="block-quote-with-icon">',
        html,
        re.DOTALL,
    )
    if not rich1:
        raise ValueError("rich-text-block not found")

    quote = re.search(
        r'<div class="block-quote-with-icon">.*?<blockquote>(.*?)</blockquote>',
        html,
        re.DOTALL,
    )
    if not quote:
        raise ValueError("quote block not found")

    body = html_to_md(rich1.group(1))
    body += (
        '\n\n<div class="block-quote-with-icon">\n'
        '<img src="/images/quote.svg" loading="lazy" alt="" class="quote-icon" />\n'
        f"<blockquote>{strip_tags(quote.group(1))}</blockquote>\n"
        "</div>\n"
    )

    after_quote = re.search(
        r'<div class="block-quote-with-icon">.*?</div>\s*<div class="w-richtext">(.*?)</div>\s*</div>\s*</div>\s*<div class="w-dyn-list">',
        html,
        re.DOTALL,
    )
    if after_quote:
        body += "\n\n" + html_to_md(after_quote.group(1))

    return body.strip() + "\n"


def extract_meta(html: str, slug: str) -> dict:
    header = re.search(
        r'<section id="home" style="[^"]*" class="section border-bottom">(.*?)</section>',
        html,
        re.DOTALL,
    )
    if not header:
        raise ValueError("header section not found")
    header_html = header.group(1)

    title = strip_tags(re.search(r"<h1 class=\"display-2\">(.*?)</h1>", header_html, re.DOTALL).group(1))
    description = strip_tags(
        re.search(r'<p class="paragraph-large margin-bottom-30">(.*?)</p>', header_html, re.DOTALL).group(1)
    )
    about_intro = strip_tags(
        re.search(r"<h2>About the Project</h2><p>(.*?)</p>", header_html, re.DOTALL).group(1)
    )
    date = strip_tags(re.search(r"<h4 class=\"margin-bottom-5\">Date:</h4><div>(.*?)</div>", header_html).group(1))
    client = strip_tags(
        re.search(r"<h4 class=\"margin-bottom-5\">Client:</h4><div>(.*?)</div>", header_html).group(1)
    )
    services = strip_tags(
        re.search(
            r'<h4 class="margin-bottom-5">Services:</h4>.*?<div class="flex-horizontal"><div>(.*?)</div>',
            header_html,
            re.DOTALL,
        ).group(1)
    )

    hero = re.search(r'<div class="main-image[^"]*">.*?src="([^"]+)"', html, re.DOTALL).group(1)

    gallery_block = re.search(
        r'class="gallery-collection-list w-dyn-items">(.*?)</div>\s*<div class="w-dyn-hide',
        html,
        re.DOTALL,
    )
    gallery = []
    if gallery_block:
        gallery = re.findall(r'src="([^"]+)"', gallery_block.group(1))

    related_block = re.search(
        r'<div class="related">(.*?)</div>\s*</div>\s*</div>\s*</section>',
        html,
        re.DOTALL,
    )
    related = list(dict.fromkeys(re.findall(r'href="/project/([^"]+)"', related_block.group(1))))

    return {
        "slug": slug,
        "title": title,
        "description": description,
        "aboutIntro": about_intro,
        "client": client,
        "date": date,
        "services": services,
        "theme": THEME_BY_SLUG[slug],
        "heroImage": hero,
        "galleryImages": gallery,
        "related": related,
    }


def yaml_quote(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def render_md(meta: dict, body: str) -> str:
    lines = [
        "---",
        f"title: {yaml_quote(meta['title'])}",
        f"description: {yaml_quote(meta['description'])}",
        f"aboutIntro: {yaml_quote(meta['aboutIntro'])}",
        f"client: {yaml_quote(meta['client'])}",
        f"date: {yaml_quote(meta['date'])}",
        f"services: {yaml_quote(meta['services'])}",
        f"theme: {yaml_quote(meta['theme'])}",
        f"heroImage: {yaml_quote(meta['heroImage'])}",
        "galleryImages:",
    ]
    for img in meta["galleryImages"]:
        lines.append(f"  - {yaml_quote(img)}")
    lines.append("related:")
    for slug in meta["related"]:
        lines.append(f"  - {yaml_quote(slug)}")
    lines.extend(["---", "", body])
    return "\n".join(lines)


def main() -> None:
    slug = sys.argv[1] if len(sys.argv) > 1 else None
    files = sorted(ASSETS.glob("project__*.html"))
    if slug:
        files = [ASSETS / f"project__{slug}.html"]

    for path in files:
        html = path.read_text()
        s = path.stem.replace("project__", "")
        meta = extract_meta(html, s)
        body = extract_body(html)
        print(render_md(meta, body))


if __name__ == "__main__":
    main()
