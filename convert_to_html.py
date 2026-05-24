#!/usr/bin/env python3
"""Convert the Clinical Risk Engine Spec markdown to a DocRaptor-safe HTML."""
import markdown
import re
from pathlib import Path

md_path = Path(__file__).parent / "CLINICAL_RISK_ENGINE_SPEC.md"
html_path = Path(__file__).parent / "CLINICAL_RISK_ENGINE_SPEC_formatted.html"

md_text = md_path.read_text()

# Convert markdown to HTML
html_body = markdown.markdown(
    md_text,
    extensions=["tables", "fenced_code", "codehilite", "toc"],
    extension_configs={
        "codehilite": {"css_class": "code-block", "guess_lang": False}
    }
)

# Clean up code blocks for print
html_body = html_body.replace('<div class="code-block">', '<div class="code-block"><pre>')

html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Apex Clinical Intelligence Platform — Clinical Risk Engine Specification</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
@page {{
    size: letter;
    margin: 0.75in 0.75in 1in 0.75in;
    @bottom-center {{
        content: "Apex Healthcare Advanced Medicine Division  |  Confidential  |  Page " counter(page);
        font-family: 'DM Sans', sans-serif;
        font-size: 7pt;
        color: #A8A8B3;
    }}
}}

@media print {{
    body {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
}}

* {{ margin: 0; padding: 0; box-sizing: border-box; }}

body {{
    font-family: 'DM Sans', sans-serif;
    font-size: 9.5pt;
    line-height: 1.6;
    color: #1E1020;
    background: #fff;
    orphans: 3;
    widows: 3;
}}

/* ===== COVER PAGE ===== */
.cover-page {{
    min-height: 10in;
    background: linear-gradient(135deg, #4A2060 0%, #2D1240 40%, #1E0D2E 100%);
    color: #F7F5F8;
    padding: 2in 1.2in 1.5in 1.2in;
    page-break-after: always;
    position: relative;
}}

.cover-page .top-bar {{
    width: 60px;
    height: 4px;
    background: #A8A8B3;
    margin-bottom: 0.5in;
}}

.cover-page h1 {{
    font-family: 'Cormorant Garamond', serif;
    font-size: 36pt;
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 0.3in;
    color: #F7F5F8;
}}

.cover-page .subtitle {{
    font-size: 14pt;
    font-weight: 400;
    color: #A8A8B3;
    margin-bottom: 0.6in;
    line-height: 1.5;
}}

.cover-page .meta-block {{
    margin-top: 1in;
    border-top: 1px solid rgba(168,168,179,0.3);
    padding-top: 0.3in;
}}

.cover-page .meta-item {{
    font-size: 9pt;
    color: #A8A8B3;
    margin-bottom: 6px;
}}

.cover-page .meta-item strong {{
    color: #F7F5F8;
    font-weight: 600;
}}

/* ===== TABLE OF CONTENTS ===== */
.toc-page {{
    padding: 0.5in 0;
    page-break-after: always;
}}

.toc-page h2 {{
    font-family: 'Cormorant Garamond', serif;
    font-size: 22pt;
    color: #4A2060;
    margin-bottom: 0.3in;
    padding-bottom: 8px;
    border-bottom: 2px solid #4A2060;
}}

.toc-item {{
    font-size: 11pt;
    padding: 8px 0;
    border-bottom: 1px solid #E8E6EA;
    color: #1E1020;
}}

.toc-item .num {{
    display: inline-block;
    width: 30px;
    font-weight: 600;
    color: #4A2060;
}}

/* ===== CONTENT STYLES ===== */
h1 {{
    font-family: 'Cormorant Garamond', serif;
    font-size: 24pt;
    color: #4A2060;
    margin: 0.4in 0 0.15in 0;
    padding-bottom: 6px;
    border-bottom: 2px solid #4A2060;
    page-break-after: avoid;
}}

h2 {{
    font-family: 'Cormorant Garamond', serif;
    font-size: 18pt;
    color: #4A2060;
    margin: 0.35in 0 0.12in 0;
    padding-left: 12px;
    border-left: 4px solid #4A2060;
    page-break-after: avoid;
}}

h3 {{
    font-family: 'DM Sans', sans-serif;
    font-size: 13pt;
    font-weight: 600;
    color: #2D1240;
    margin: 0.2in 0 0.08in 0;
    page-break-after: avoid;
}}

h4 {{
    font-family: 'DM Sans', sans-serif;
    font-size: 11pt;
    font-weight: 600;
    color: #4A2060;
    margin: 0.15in 0 0.06in 0;
    page-break-after: avoid;
}}

h5 {{
    font-size: 10pt;
    font-weight: 600;
    color: #1E1020;
    margin: 0.1in 0 4px 0;
}}

p {{
    margin-bottom: 8px;
    text-align: justify;
}}

strong {{
    font-weight: 600;
    color: #2D1240;
}}

em {{
    font-style: italic;
}}

/* ===== TABLES ===== */
table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px 0;
    font-size: 8.5pt;
    line-height: 1.4;
}}

thead {{
    background: #4A2060;
    color: #F7F5F8;
}}

thead th {{
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    font-size: 8pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}}

tbody tr {{
    break-inside: avoid;
    page-break-inside: avoid;
}}

tbody tr:nth-child(even) {{
    background: #F7F5F8;
}}

tbody td {{
    padding: 5px 8px;
    border-bottom: 1px solid #E8E6EA;
    vertical-align: top;
}}

/* ===== LISTS ===== */
ul, ol {{
    margin: 6px 0 12px 20px;
}}

li {{
    margin-bottom: 4px;
}}

/* Checklist items */
li:has(input[type="checkbox"]) {{
    list-style: none;
    margin-left: -16px;
}}

/* ===== CODE BLOCKS ===== */
pre, code {{
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 8pt;
}}

code {{
    background: #F7F5F8;
    padding: 1px 4px;
    border-radius: 3px;
    color: #4A2060;
}}

pre {{
    background: #1E1020;
    color: #E8E6EA;
    padding: 12px 16px;
    border-radius: 4px;
    margin: 10px 0 14px 0;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    line-height: 1.5;
    page-break-inside: avoid;
}}

pre code {{
    background: none;
    color: inherit;
    padding: 0;
}}

/* ===== BLOCKQUOTES (Documentation templates) ===== */
blockquote {{
    background: #F7F5F8;
    border-left: 4px solid #A8A8B3;
    padding: 12px 16px;
    margin: 10px 0 14px 0;
    font-size: 9pt;
    color: #2D1240;
    page-break-inside: avoid;
}}

blockquote p {{
    margin-bottom: 6px;
}}

/* ===== SECTION DIVIDERS ===== */
hr {{
    border: none;
    border-top: 1px solid #E8E6EA;
    margin: 0.25in 0;
}}

/* ===== ALERT / CALLOUT BOXES ===== */
.alert-box {{
    background: #FFF3E0;
    border-left: 4px solid #F5A623;
    padding: 10px 14px;
    margin: 10px 0;
    font-size: 9pt;
    break-inside: avoid;
}}

/* ===== PAGE BREAK CONTROLS ===== */
.section-break {{
    page-break-before: always;
}}

h2 {{
    page-break-after: avoid;
}}

/* Keep small cards/items together */
.card, .highlight-box, .step, .checklist-item, .timeline-item {{
    break-inside: avoid;
    page-break-inside: avoid;
}}

/* Don't protect large containers */
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-page">
    <div class="top-bar"></div>
    <h1>Apex Clinical Intelligence Platform</h1>
    <div class="subtitle">
        Clinical Risk Stratification &amp; Management Plan Engine<br>
        Comprehensive Technical &amp; Clinical Specification
    </div>
    <div style="margin-top: 0.8in;">
        <p style="font-size: 10pt; color: #A8A8B3; line-height: 1.8;">
            A 10-domain weighted risk scoring model for skilled nursing facility residents.<br>
            Evidence-based, INTERACT II-aligned, immediately physician-actionable.<br>
            Designed for Board-Certified Medical Directors overseeing SNF populations.
        </p>
    </div>
    <div class="meta-block">
        <div class="meta-item"><strong>Version:</strong> 1.0</div>
        <div class="meta-item"><strong>Date:</strong> April 15, 2026</div>
        <div class="meta-item"><strong>Classification:</strong> Confidential &mdash; Internal Use Only</div>
        <div class="meta-item"><strong>Prepared by:</strong> Ibrahim M. Rizqui, M.D., CMD</div>
        <div class="meta-item"><strong>Organization:</strong> Apex Healthcare Advanced Medicine Division</div>
    </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="toc-page">
    <h2>Table of Contents</h2>
    <div class="toc-item"><span class="num">1.</span> Executive Summary</div>
    <div class="toc-item"><span class="num">2.</span> Clinical Risk Algorithm &mdash; Domain-by-Domain Specification</div>
    <div class="toc-item" style="padding-left: 30px; font-size: 9.5pt; color: #666;">
        D1: Vital Signs &amp; Physiologic Instability &bull;
        D2: Functional Decline &bull;
        D3: Cognitive &amp; Behavioral Status &bull;
        D4: Clinical Complexity &bull;
        D5: Medication Safety &bull;
        D6: Nutritional &amp; Metabolic Status &bull;
        D7: Wound &amp; Skin Integrity &bull;
        D8: Infection &amp; Inflammatory Markers &bull;
        D9: Psychosocial &amp; Care Engagement &bull;
        D10: Recent Clinical Events (Velocity Factor)
    </div>
    <div class="toc-item"><span class="num">3.</span> Scoring Model &amp; Risk Bands</div>
    <div class="toc-item"><span class="num">4.</span> Management Plan Framework</div>
    <div class="toc-item"><span class="num">5.</span> 10 Clinical Scenario Templates</div>
    <div class="toc-item" style="padding-left: 30px; font-size: 9.5pt; color: #666;">
        CHF Exacerbation &bull;
        Sepsis / Systemic Infection &bull;
        Altered Mental Status / Delirium &bull;
        UTI with Systemic Signs &bull;
        COPD Exacerbation &bull;
        Fall with Injury &bull;
        Pressure Injury Deterioration &bull;
        Aspiration Pneumonia &bull;
        Medication Toxicity &bull;
        Acute Functional Decline
    </div>
    <div class="toc-item"><span class="num">6.</span> Technical Implementation Spec for Codex</div>
    <div class="toc-item" style="padding-left: 30px; font-size: 9.5pt; color: #666;">
        Data Input Schema &bull;
        Scoring Function Pseudocode &bull;
        Composite Score Aggregation &bull;
        Management Plan Selection Logic &bull;
        Output Schema &bull;
        Edge Cases &amp; Null Data Handling
    </div>
    <div class="toc-item"><span class="num">7.</span> Evidence Base &amp; References</div>
</div>

<!-- MAIN CONTENT -->
{html_body}

</body>
</html>
"""

html_path.write_text(html_template)
print(f"HTML written to {html_path} ({len(html_template):,} bytes)")
