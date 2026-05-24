#!/usr/bin/env python3
"""
QIS_PCC_Workflow_Review.pdf generator
PointClickCare Developer Program — Workflow Review Submission
Organization: Apex Healthcare, LLC
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Group
from reportlab.graphics import renderPDF
from reportlab.platypus.flowables import Flowable
from reportlab.lib.colors import HexColor
import os

# ── Color palette ──────────────────────────────────────────────────────────────
NAVY       = HexColor('#0D1B3E')   # deep navy
INDIGO     = HexColor('#1E3A8A')   # brand indigo
INDIGO_MID = HexColor('#2563EB')   # mid indigo
SKY        = HexColor('#DBEAFE')   # light blue fill
SLATE      = HexColor('#475569')   # body text
SLATE_LT   = HexColor('#94A3B8')   # muted text
WHITE      = colors.white
TEAL       = HexColor('#0F766E')   # accent teal
TEAL_LT    = HexColor('#CCFBF1')   # teal fill
AMBER      = HexColor('#B45309')   # warning amber
AMBER_LT   = HexColor('#FEF3C7')   # amber fill
RED_LT     = HexColor('#FEE2E2')
GREEN_LT   = HexColor('#DCFCE7')
GRAY_BG    = HexColor('#F8FAFC')   # section bg
RULE       = HexColor('#E2E8F0')   # divider

OUTPUT_PATH = '/Users/elonai/.openclaw/workspace/builds/apex-clinical-dashboard/QIS_PCC_Workflow_Review.pdf'


# ── Custom Flowables ────────────────────────────────────────────────────────────

class HeaderBanner(Flowable):
    """Full-width deep-navy header banner."""
    def __init__(self, width, height=1.15*inch):
        super().__init__()
        self.width = width
        self.height = height

    def draw(self):
        c = self.canv
        # Background
        c.setFillColor(NAVY)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        # Accent stripe
        c.setFillColor(INDIGO_MID)
        c.rect(0, 0, self.width, 4, fill=1, stroke=0)
        # App name
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 20)
        c.drawString(0.35*inch, self.height - 0.42*inch,
                     'Quantum Intelligence System (QIS)')
        # Sub line
        c.setFont('Helvetica', 10)
        c.setFillColor(HexColor('#93C5FD'))
        c.drawString(0.35*inch, self.height - 0.65*inch,
                     'PointClickCare Developer Program — Workflow Review Submission')
        # Right badge
        c.setFillColor(INDIGO_MID)
        c.roundRect(self.width - 2.2*inch, self.height - 0.78*inch,
                    1.85*inch, 0.55*inch, 4, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont('Helvetica-Bold', 8)
        c.drawCentredString(self.width - 1.275*inch, self.height - 0.50*inch,
                            'APPLICATION ID')
        c.setFont('Helvetica', 9)
        c.drawCentredString(self.width - 1.275*inch, self.height - 0.65*inch,
                            'quantumintelligence')


class SectionLabel(Flowable):
    """Left-accented section header pill."""
    def __init__(self, text, width, number=''):
        super().__init__()
        self.text = text
        self.number = number
        self.width = width
        self.height = 0.38*inch

    def draw(self):
        c = self.canv
        c.setFillColor(GRAY_BG)
        c.roundRect(0, 0, self.width, self.height, 4, fill=1, stroke=0)
        c.setFillColor(INDIGO)
        c.rect(0, 0, 4, self.height, fill=1, stroke=0)
        if self.number:
            c.setFillColor(INDIGO)
            c.setFont('Helvetica-Bold', 9)
            c.drawString(0.18*inch, 0.12*inch, self.number)
        c.setFillColor(NAVY)
        c.setFont('Helvetica-Bold', 11)
        offset = 0.42*inch if self.number else 0.18*inch
        c.drawString(offset, 0.12*inch, self.text.upper())


class WorkflowDiagram(Flowable):
    """Horizontal-flow workflow diagram with 6 stages."""

    BOX_W = 88
    BOX_H = 62
    ARROW = 22
    PAD_X = 18
    PAD_Y = 18
    COLS = 3
    ROWS = 2

    STAGES = [
        {
            'num': '1',
            'title': 'User Auth',
            'color': INDIGO,
            'fill': SKY,
            'lines': ['QIS Web App', 'FastAPI validates', 'JWT issued (8h)', 'Stored client-side'],
        },
        {
            'num': '2',
            'title': 'PCC OAuth2',
            'color': TEAL,
            'fill': TEAL_LT,
            'lines': ['Client Credentials', 'Grant to PCC /auth/', 'token endpoint', 'Bearer token cached'],
        },
        {
            'num': '3',
            'title': 'PCC API Pull',
            'color': INDIGO_MID,
            'fill': HexColor('#EFF6FF'),
            'lines': ['GET /facilities', 'GET /patients?facId', 'GET /patients/{id}', 'Census + detail'],
        },
        {
            'num': '4',
            'title': 'Risk Engine',
            'color': HexColor('#7C3AED'),
            'fill': HexColor('#EDE9FE'),
            'lines': ['10-domain scoring', 'Composite 0–100', 'Critical / High /','Moderate / Low'],
        },
        {
            'num': '5',
            'title': 'AI Care Plans',
            'color': AMBER,
            'fill': AMBER_LT,
            'lines': ['Claude Sonnet API', 'F656/F657/F658', 'CMS compliance', 'Clinician approval'],
        },
        {
            'num': '6',
            'title': 'Dashboard',
            'color': HexColor('#059669'),
            'fill': GREEN_LT,
            'lines': ['Triage list sorted', 'Facility KPI panel', 'Patient detail view', 'Intervention log'],
        },
    ]

    def __init__(self, avail_width):
        super().__init__()
        self.avail_width = avail_width
        total_w = self.COLS * self.BOX_W + (self.COLS - 1) * self.ARROW + 2 * self.PAD_X
        total_h = self.ROWS * self.BOX_H + (self.ROWS - 1) * 30 + 2 * self.PAD_Y + 20
        self.width = avail_width
        self.height = total_h
        self._scale = min(1.0, (avail_width - 0) / total_w)

    def _box_xy(self, idx):
        """Return bottom-left (x, y) of box in diagram coords."""
        col = idx % self.COLS
        row = idx // self.COLS
        x = self.PAD_X + col * (self.BOX_W + self.ARROW)
        # Row 0 at top = higher y; row 1 below
        row_gap = 30
        total_h_inner = self.ROWS * self.BOX_H + (self.ROWS - 1) * row_gap
        y_top = self.PAD_Y + total_h_inner
        y = y_top - (row + 1) * self.BOX_H - row * row_gap
        return x, y

    def draw(self):
        c = self.canv
        c.saveState()
        s = self._scale
        c.scale(s, s)

        for idx, stage in enumerate(self.STAGES):
            x, y = self._box_xy(idx)
            col = idx % self.COLS

            # Draw arrow BEFORE this box (except first in each row)
            if col > 0:
                ax_end = x
                ax_start = ax_end - self.ARROW
                ay = y + self.BOX_H / 2
                c.setStrokeColor(SLATE_LT)
                c.setLineWidth(1.5)
                c.line(ax_start, ay, ax_end - 6, ay)
                # Arrowhead
                c.setFillColor(SLATE_LT)
                c.setStrokeColor(SLATE_LT)
                c.setLineWidth(0)
                pts = [ax_end - 6, ay + 4, ax_end, ay, ax_end - 6, ay - 4]
                p = c.beginPath()
                p.moveTo(pts[0], pts[1])
                p.lineTo(pts[2], pts[3])
                p.lineTo(pts[4], pts[5])
                p.close()
                c.drawPath(p, fill=1, stroke=0)

            # Draw down-arrow from row 0 box to row 1 box (col 2 → col 3 transition)
            if idx == self.COLS - 1:  # last in row 0
                bx, by = self._box_xy(idx)       # row 0 last box
                bx2, by2 = self._box_xy(idx + 1)  # row 1 first box
                # from bottom of last row-0 box center, down to top of row-1 first box's left midpoint
                mid_x_start = bx + self.BOX_W / 2
                mid_x_end   = bx2 + self.BOX_W / 2
                top_row0 = by              # bottom of row-0 box
                top_row1 = by2 + self.BOX_H  # top of row-1 box
                mid_y = (top_row0 + top_row1) / 2

                c.setStrokeColor(SLATE_LT)
                c.setLineWidth(1.5)
                c.setDash([4, 3])
                # down from center of last row-0 box
                c.line(mid_x_start, top_row0, mid_x_start, mid_y)
                # across to above row-1 first box
                c.line(mid_x_start, mid_y, mid_x_end, mid_y)
                # down to top of row-1 first box
                c.line(mid_x_end, mid_y, mid_x_end, top_row1 + 6)
                c.setDash()
                # arrowhead pointing down
                c.setFillColor(SLATE_LT)
                pts = [mid_x_end - 4, top_row1 + 6, mid_x_end, top_row1, mid_x_end + 4, top_row1 + 6]
                p = c.beginPath()
                p.moveTo(pts[0], pts[1])
                p.lineTo(pts[2], pts[3])
                p.lineTo(pts[4], pts[5])
                p.close()
                c.drawPath(p, fill=1, stroke=0)

            # Shadow
            c.setFillColor(HexColor('#CBD5E1'))
            c.setStrokeColor(colors.transparent)
            c.roundRect(x + 3, y - 3, self.BOX_W, self.BOX_H, 6, fill=1, stroke=0)

            # Box fill
            c.setFillColor(stage['fill'])
            c.setStrokeColor(stage['color'])
            c.setLineWidth(1.5)
            c.roundRect(x, y, self.BOX_W, self.BOX_H, 6, fill=1, stroke=1)

            # Color header strip
            c.setFillColor(stage['color'])
            c.setStrokeColor(colors.transparent)
            # top strip (clip to rounded rect manually via small rect inside)
            c.rect(x, y + self.BOX_H - 18, self.BOX_W, 18, fill=1, stroke=0)
            # re-draw top rounded corners over the strip
            c.setFillColor(stage['color'])
            c.roundRect(x, y + self.BOX_H - 18, self.BOX_W, 18, 6, fill=1, stroke=0)

            # Number badge
            c.setFillColor(WHITE)
            c.setFont('Helvetica-Bold', 8)
            c.drawCentredString(x + 10, y + self.BOX_H - 13, stage['num'])

            # Title in header
            c.setFillColor(WHITE)
            c.setFont('Helvetica-Bold', 8)
            c.drawCentredString(x + self.BOX_W / 2 + 4, y + self.BOX_H - 13, stage['title'])

            # Body lines
            c.setFillColor(NAVY)
            c.setFont('Helvetica', 7)
            for li, line in enumerate(stage['lines']):
                ly = y + self.BOX_H - 26 - li * 9
                c.drawCentredString(x + self.BOX_W / 2, ly, line)

        c.restoreState()


class DataFlowTable(Flowable):
    """Compact data-flow table showing actor → action → system."""
    pass  # We'll use a regular Table instead


# ── Build document ──────────────────────────────────────────────────────────────

def build_pdf():
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=letter,
        leftMargin=0.55*inch,
        rightMargin=0.55*inch,
        topMargin=0.5*inch,
        bottomMargin=0.5*inch,
        title='QIS Workflow Review — PointClickCare',
        author='Apex Healthcare, LLC',
        subject='PCC Developer Program Workflow Review',
    )
    W = letter[0] - 1.1*inch  # usable width

    styles = getSampleStyleSheet()
    body = ParagraphStyle('body', fontName='Helvetica', fontSize=9,
                          textColor=SLATE, leading=14, spaceAfter=4)
    body_sm = ParagraphStyle('body_sm', fontName='Helvetica', fontSize=8,
                             textColor=SLATE, leading=12, spaceAfter=2)
    caption = ParagraphStyle('caption', fontName='Helvetica', fontSize=7.5,
                             textColor=SLATE_LT, leading=11, alignment=TA_CENTER)
    bold_sm = ParagraphStyle('bold_sm', fontName='Helvetica-Bold', fontSize=9,
                             textColor=NAVY, leading=13)
    label = ParagraphStyle('label', fontName='Helvetica-Bold', fontSize=8,
                           textColor=INDIGO, leading=12)
    code_style = ParagraphStyle('code', fontName='Courier', fontSize=7.5,
                                textColor=HexColor('#1E40AF'), leading=11,
                                backColor=HexColor('#EFF6FF'), borderPadding=3)

    story = []

    # ── Header ──────────────────────────────────────────────────────────────
    story.append(HeaderBanner(W))
    story.append(Spacer(1, 0.18*inch))

    # ── Meta info row ────────────────────────────────────────────────────────
    meta_data = [
        [Paragraph('<b>Organization</b>', label),
         Paragraph('Apex Healthcare, LLC', body),
         Paragraph('<b>Organization ID</b>', label),
         Paragraph('apequa2310', body)],
        [Paragraph('<b>Submission Date</b>', label),
         Paragraph('2026-05-23', body),
         Paragraph('<b>PCC Base URL</b>', label),
         Paragraph('https://connect.pointclickcare.com', body)],
        [Paragraph('<b>Backend Stack</b>', label),
         Paragraph('Python 3.11 / FastAPI / Railway (cloud)', body),
         Paragraph('<b>Facilities</b>', label),
         Paragraph('Multi-Medical Center (ID 324, ~110 res.) · Heritage Center (ID 327, ~142 res.)', body)],
    ]
    meta_tbl = Table(meta_data, colWidths=[1.2*inch, 2.55*inch, 1.2*inch, 2.55*inch])
    meta_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), GRAY_BG),
        ('ROWBACKGROUNDS', (0, 0), (-1, -1), [WHITE, GRAY_BG, WHITE]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('GRID', (0, 0), (-1, -1), 0.3, RULE),
        ('ROUNDEDCORNERS', [4]),
    ]))
    story.append(meta_tbl)
    story.append(Spacer(1, 0.14*inch))

    # ── Section 1: App Description ───────────────────────────────────────────
    story.append(SectionLabel('Application Overview', W, '§1'))
    story.append(Spacer(1, 0.08*inch))
    story.append(Paragraph(
        'The <b>Quantum Intelligence System (QIS)</b> is a secure, HIPAA-compliant clinical '
        'intelligence platform developed exclusively for Apex Healthcare, LLC. QIS integrates '
        'with PointClickCare via OAuth2 to retrieve real-time census and patient data across '
        'two skilled nursing facilities. It applies a proprietary 10-domain clinical risk engine '
        'to generate composite risk scores for each resident, surfaces AI-assisted care plan '
        'suggestions for clinician review, and presents a unified triage dashboard to support '
        'daily clinical decision-making.',
        body))
    story.append(Paragraph(
        'All AI-generated care plan language is presented to the clinician for review and '
        'explicit approval before any write-back to PCC. No PHI is persisted beyond the active '
        'session. The system operates under a signed BAA with Anthropic (Claude API) and '
        'follows PointClickCare API usage policies.',
        body))
    story.append(Spacer(1, 0.14*inch))

    # ── Section 2: Intended Users ────────────────────────────────────────────
    story.append(SectionLabel('Intended Users & Roles', W, '§2'))
    story.append(Spacer(1, 0.08*inch))

    users_data = [
        [Paragraph('<b>User Role</b>', bold_sm),
         Paragraph('<b>QIS Permission</b>', bold_sm),
         Paragraph('<b>Primary Use Cases</b>', bold_sm)],
        [Paragraph('Medical Director', body),
         Paragraph('Admin', body),
         Paragraph('Clinical triage review · Risk score investigation · '
                   'Intervention logging · Care plan review & approval', body)],
        [Paragraph('Director of Nursing (DON)', body),
         Paragraph('Admin', body),
         Paragraph('Census monitoring · High-risk resident alerts · '
                   'Daily triage prioritization · Staff assignment support', body)],
        [Paragraph('Facility Administrator', body),
         Paragraph('Viewer', body),
         Paragraph('Operational KPI dashboard · Facility-level risk distribution · '
                   'Census counts · Non-clinical summary views', body)],
    ]
    users_tbl = Table(users_data, colWidths=[1.6*inch, 1.1*inch, W - 2.7*inch])
    users_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, SKY]),
        ('GRID', (0, 0), (-1, -1), 0.3, RULE),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(users_tbl)
    story.append(Spacer(1, 0.14*inch))

    # ── Section 3: PCC API Endpoints ─────────────────────────────────────────
    story.append(SectionLabel('PCC API Endpoints Called', W, '§3'))
    story.append(Spacer(1, 0.08*inch))

    ep_data = [
        [Paragraph('<b>Method</b>', bold_sm),
         Paragraph('<b>Endpoint</b>', bold_sm),
         Paragraph('<b>Purpose</b>', bold_sm),
         Paragraph('<b>Auth</b>', bold_sm)],
        [Paragraph('POST', body),
         Paragraph('/auth/token', code_style),
         Paragraph('Client Credentials Grant — obtain Bearer token for PCC API access', body),
         Paragraph('Customer Key + Client Secret', body)],
        [Paragraph('GET', body),
         Paragraph('/api/public/preview1/facilities', code_style),
         Paragraph('Retrieve list of authorized facilities for the organization', body),
         Paragraph('Bearer token', body)],
        [Paragraph('GET', body),
         Paragraph('/api/public/preview1/patients?facId={id}', code_style),
         Paragraph('Retrieve patient census for a given facility (IDs 324, 327)', body),
         Paragraph('Bearer token', body)],
        [Paragraph('GET', body),
         Paragraph('/api/public/preview1/patients/{patientId}', code_style),
         Paragraph('Retrieve individual patient record for risk engine input', body),
         Paragraph('Bearer token', body)],
    ]
    ep_col_w = [0.6*inch, 2.8*inch, W - 4.6*inch, 1.2*inch]
    ep_tbl = Table(ep_data, colWidths=ep_col_w)
    ep_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('GRID', (0, 0), (-1, -1), 0.3, RULE),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(ep_tbl)
    story.append(Spacer(1, 0.14*inch))

    # ── Section 4: Back-End Workflow Diagram ─────────────────────────────────
    story.append(KeepTogether([
        SectionLabel('Back-End Workflow Diagram', W, '§4'),
        Spacer(1, 0.1*inch),
        WorkflowDiagram(W),
        Spacer(1, 0.05*inch),
        Paragraph(
            'Data flow: User Auth → PCC OAuth2 Token → PCC API Data Pull → '
            'Clinical Risk Engine → AI Care Plans Layer → Dashboard Rendering',
            caption),
    ]))
    story.append(Spacer(1, 0.14*inch))

    # ── Section 5: Detailed Workflow Steps ───────────────────────────────────
    story.append(SectionLabel('Detailed Back-End Workflow', W, '§5'))
    story.append(Spacer(1, 0.08*inch))

    steps = [
        (
            'Step 1 — User Authentication',
            INDIGO, SKY,
            [
                'User accesses the QIS web application (hosted on Railway).',
                'User submits credentials (username + password) via HTTPS POST.',
                'FastAPI validates credentials against the user database (bcrypt hash comparison).',
                'On success, a JWT is issued with 8-hour expiry and HS256 signing.',
                'JWT is stored client-side (memory / httpOnly cookie) and included as '
                'Authorization: Bearer <token> on all subsequent API requests.',
            ]
        ),
        (
            'Step 2 — PCC OAuth2 Token Acquisition',
            TEAL, TEAL_LT,
            [
                'QIS backend performs a Client Credentials Grant (OAuth2) to '
                'https://connect.pointclickcare.com/auth/token.',
                'Request includes: grant_type=client_credentials, '
                'client_id (Customer Key: pg9JCok3xQQo9bp0cAEGbbiAtfJkWsxY), '
                'and client_secret.',
                'PCC returns a Bearer access token with a defined expiry window.',
                'Token is cached in memory with expiry tracking; auto-refreshed '
                'before expiry without user interaction.',
            ]
        ),
        (
            'Step 3 — PCC API Data Pull',
            INDIGO_MID, HexColor('#EFF6FF'),
            [
                'GET /api/public/preview1/facilities — retrieves authorized facility roster.',
                'GET /api/public/preview1/patients?facId=324 — pulls census for '
                'Multi-Medical Center (~110 residents).',
                'GET /api/public/preview1/patients?facId=327 — pulls census for '
                'Heritage Center (~142 residents).',
                'GET /api/public/preview1/patients/{patientId} — fetches individual '
                'patient detail records as needed for risk scoring.',
                'All calls include Authorization: Bearer <pcc_token> header. '
                'Responses are parsed and held in session memory only.',
            ]
        ),
        (
            'Step 4 — Clinical Risk Engine (10-Domain Scoring)',
            HexColor('#7C3AED'), HexColor('#EDE9FE'),
            [
                'Each patient record is evaluated across 10 clinical domains:',
                '  (1) Fall Risk · (2) Wound/Skin Integrity · (3) Infection/Sepsis Risk',
                '  (4) Nutrition/Weight Status · (5) Pain Management · '
                '(6) Cognition/Behavioral',
                '  (7) Functional Decline · (8) Readmission Risk · '
                '(9) Medication Safety · (10) Goals of Care',
                'Domain scores are weighted and summed into a Composite Score (0–100).',
                'Risk bands: Critical (80–100) · High (60–79) · '
                'Moderate (40–59) · Low (0–39).',
                'Triage list is sorted descending by composite score for clinical review.',
            ]
        ),
        (
            'Step 5 — AI Care Plans Layer (Claude Sonnet API)',
            AMBER, AMBER_LT,
            [
                'Care plan text (from PCC or clinician input) is submitted to the Claude Sonnet API.',
                'Prompt instructs the model to evaluate compliance with CMS regulations: '
                'F656 (care plan development), F657 (care plan revision), '
                'F658 (services provided meet professional standards).',
                'Model returns: compliance assessment, identified gaps, and SMART-goal rewrites.',
                'Output is displayed to the clinician in a review panel — no automatic write-back occurs.',
                'Clinician explicitly approves, edits, or discards AI suggestions before any '
                'changes are submitted to PCC.',
                'BAA with Anthropic is in place; no PHI is retained by the Claude API beyond the call.',
            ]
        ),
        (
            'Step 6 — Dashboard Rendering & Output',
            HexColor('#059669'), GREEN_LT,
            [
                'Triage list rendered sorted by composite risk score (Critical first).',
                'Facility KPI panel: risk distribution chart, census counts, '
                'average composite score per facility.',
                'Patient detail view: demographics, risk domain breakdown, care plan status, '
                'clinical narrative.',
                'Printable patient reports generated as PDF exports for rounds/meetings.',
                'Intervention logging: clinicians log actions taken; entries persisted to '
                'PostgreSQL database with timestamp and clinician ID.',
                'All dashboard data is derived from in-session PCC API responses; '
                'no PHI is written to persistent storage beyond the intervention log.',
            ]
        ),
    ]

    step_title_style = ParagraphStyle(
        'step_title', fontName='Helvetica-Bold', fontSize=9,
        textColor=NAVY, leading=14, spaceAfter=2
    )

    for title, accent, fill, bullets in steps:
        # Build inner content rows: title + bullet paragraphs
        inner_rows = [[Paragraph(f'<b>{title}</b>', ParagraphStyle(
            'sh', fontName='Helvetica-Bold', fontSize=9, textColor=accent, leading=14))]]
        for b in bullets:
            inner_rows.append([Paragraph(f'•  {b}', body_sm)])

        inner_col_w = W - 0.15*inch - 0.16*inch  # subtract accent bar and padding
        inner_tbl = Table(inner_rows, colWidths=[inner_col_w])
        inner_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), fill),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, 0), 6),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 6),
            ('TOPPADDING', (0, 1), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -2), 2),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))

        # Outer two-column table: accent bar | content
        outer_tbl = Table(
            [[Paragraph('', body_sm), inner_tbl]],
            colWidths=[0.15*inch, W - 0.15*inch]
        )
        outer_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), accent),
            ('BACKGROUND', (1, 0), (1, -1), fill),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(KeepTogether([outer_tbl, Spacer(1, 0.08*inch)]))

    # ── Section 6: Data Security ─────────────────────────────────────────────
    story.append(SectionLabel('Data Security & Compliance', W, '§6'))
    story.append(Spacer(1, 0.08*inch))

    sec_rows = [
        [Paragraph('<b>Control</b>', bold_sm), Paragraph('<b>Implementation</b>', bold_sm)],
        [Paragraph('Transport Security', body), Paragraph('All connections use TLS 1.2+ (HTTPS). Railway enforces HTTPS on all endpoints.', body)],
        [Paragraph('User Authentication', body), Paragraph('JWT tokens (HS256, 8-hour expiry). Passwords stored as bcrypt hashes. No plaintext credentials stored.', body)],
        [Paragraph('PCC Token Handling', body), Paragraph('PCC Bearer token cached in server memory only. Never written to disk, logs, or database. Auto-refreshed on expiry.', body)],
        [Paragraph('PHI Storage Policy', body), Paragraph('No PHI persisted beyond the active session. PCC patient data lives only in server memory during API response processing.', body)],
        [Paragraph('Intervention Log', body), Paragraph('Only clinician-authored free-text notes, timestamps, and clinician IDs are written to the database. No PCC patient fields stored.', body)],
        [Paragraph('AI/LLM (Claude API)', body), Paragraph('BAA signed with Anthropic. Care plan text is submitted per-call; Anthropic does not retain PHI beyond the API response.', body)],
        [Paragraph('Access Control', body), Paragraph('Role-based: Admin (Medical Director, DON) vs. Viewer (Administrator). Enforced at API layer via JWT claims.', body)],
        [Paragraph('Audit & Logging', body), Paragraph('Application-level access logs retained on Railway. No PHI included in logs. Intervention actions logged with actor identity.', body)],
        [Paragraph('BAA Coverage', body), Paragraph('Signed BAAs in place: Anthropic (Claude) ✓ · Google ✓ · OpenAI ✓ · Railway (infra) ✓', body)],
    ]
    sec_tbl = Table(sec_rows, colWidths=[1.55*inch, W - 1.55*inch])
    sec_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, GRAY_BG]),
        ('GRID', (0, 0), (-1, -1), 0.3, RULE),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(sec_tbl)
    story.append(Spacer(1, 0.18*inch))

    # ── Footer rule ──────────────────────────────────────────────────────────
    story.append(HRFlowable(width=W, thickness=1, color=RULE))
    story.append(Spacer(1, 0.06*inch))
    story.append(Paragraph(
        'Apex Healthcare, LLC · Application ID: quantumintelligence · '
        'Submitted to PointClickCare Developer Program · 2026-05-23 · '
        'CONFIDENTIAL — For PCC Review Only',
        ParagraphStyle('footer', fontName='Helvetica', fontSize=7,
                       textColor=SLATE_LT, alignment=TA_CENTER, leading=10)
    ))

    # ── Build ────────────────────────────────────────────────────────────────
    doc.build(story)
    size = os.path.getsize(OUTPUT_PATH)
    print(f'PDF generated: {OUTPUT_PATH}')
    print(f'File size: {size:,} bytes ({size / 1024:.1f} KB)')
    if size > 1_000_000:
        print('WARNING: file exceeds 1 MB limit!')
    else:
        print(f'OK — under 1 MB limit ({size / 1024 / 1024:.3f} MB)')


if __name__ == '__main__':
    build_pdf()
