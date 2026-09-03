"""Deterministic offline stand-in for the Qwen model.

Used when AI_MOCK=true or the API key is missing, and as a fallback when the
remote call fails — keeps the whole product flow testable without cost.
"""

import re

KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "React", "Node.js", "Flask", "Django",
    "SQL", "PostgreSQL", "Data Analysis", "Machine Learning", "Deep Learning",
    "UI/UX Design", "Figma", "Graphic Design", "Content Writing", "Copywriting",
    "Digital Marketing", "SEO", "Social Media Marketing", "Video Editing",
    "WordPress", "Shopify", "Customer Support", "Excel", "Power BI", "Tableau",
    "Docker", "AWS", "Git", "Java", "C++", "Flutter", "React Native",
    "Project Management", "Communication", "Translation", "Accounting",
]


def _normalize(name: str) -> str:
    return re.sub(r"\s+", " ", name).strip().lower()


_CATALOG = {_normalize(s): s for s in KNOWN_SKILLS}


def extract_skills(text: str) -> dict:
    found: list[str] = []
    lowered = f" {text.lower()} "
    for key, canonical in _CATALOG.items():
        pattern = r"(?<![a-z0-9])" + re.escape(key) + r"(?![a-z0-9])"
        if re.search(pattern, lowered):
            found.append(canonical)
    if not found:
        words = re.findall(r"[A-Za-z][A-Za-z+#. ]{2,30}", text)
        seen = set()
        for w in words:
            w = w.strip()
            if w.lower() not in seen and len(seen) < 8:
                seen.add(w.lower())
                found.append(w)
    summary = f"Profile with {len(found)} identified skill(s) across your input."
    return {"skills": found[:50], "summary": summary}


def generate_insight(skills: list[str], opportunities: list[str], gaps: list[str]) -> dict:
    top = opportunities[0] if opportunities else "roles matching your profile"
    headline = f"Strong match potential in {len(opportunities)} opportunity areas"
    if gaps:
        insight = (
            f"Your {skills[0] if skills else 'current'} background aligns well with {top}. "
            f"Closing the gap in {gaps[0]} would unlock stronger matches — a short course "
            "can get you there in weeks."
        )
    else:
        insight = (
            f"Your skill set maps cleanly onto {top}. Apply to your top matches now while "
            "demand stays high."
        )
    return {"headline": headline, "insight": insight}


def counselor(history: list[dict]) -> str:
    last = ""
    for entry in reversed(history):
        if entry.get("role") == "user":
            last = (entry.get("content") or "").lower()
            break
    if "match score" in last:
        return (
            "Your match score compares your skills against each opportunity's required "
            "skills — the more overlap, the higher the score. Above 70% means you're ready "
            "to apply now; below that, close one or two gaps with a short course first."
        )
    if "freelance" in last or "ready" in last:
        return (
            "You're ready to start freelancing once you have two or three solid portfolio "
            "pieces — clients care about proof more than certificates. Start with small gigs "
            "on Upwork or Fiverr to build reviews, and raise your rates after your first "
            "five completed projects."
        )
    if "learn" in last or "skill" in last or "course" in last:
        return (
            "Focus on one high-demand skill that complements what you already know — for "
            "most members that's SQL, React, or Figma. Pick a course from your skill-gap "
            "list and finish it in two to three weeks; consistency beats intensity."
        )
    return (
        "Great question! Based on your SkillBridge profile, focus on your top match and the "
        "one skill gap holding your score down. Keep your skills list up to date and I'll "
        "point you to the best next step."
    )
