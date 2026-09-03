"""Idempotent seed data for local development and demos."""

from ..extensions import db
from ..models import Course, DemandStat, Opportunity, Skill, User

SKILLS = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "Data Analysis",
    "Machine Learning", "UI/UX Design", "Figma", "Graphic Design",
    "Content Writing", "Digital Marketing", "SEO", "Video Editing",
    "WordPress", "Customer Support", "Excel", "Power BI", "Docker", "AWS",
    "Project Management", "Flutter",
]

# (title, type, source, description, skills)
OPPORTUNITIES = [
    ("Frontend Developer (React)", "job", "LinkedIn",
     "Build responsive dashboards and marketing pages for a SaaS analytics product.",
     ["React", "JavaScript", "UI/UX Design"]),
    ("Python Backend Engineer", "job", "Indeed",
     "Design REST APIs and data pipelines for a fintech scale-up.",
     ["Python", "SQL", "Docker", "AWS"]),
    ("Data Analyst (Remote)", "job", "LinkedIn",
     "Turn raw product data into weekly stakeholder reports and dashboards.",
     ["Data Analysis", "SQL", "Excel", "Power BI"]),
    ("ML Engineer - Recommendation Systems", "job", "LinkedIn",
     "Train and ship ranking models for an e-commerce marketplace.",
     ["Machine Learning", "Python", "SQL"]),
    ("Freelance WordPress Developer", "freelance", "Upwork",
     "Build and customize small-business WordPress sites; theme tweaks and speedups.",
     ["WordPress", "JavaScript"]),
    ("UI/UX Designer for Mobile App", "freelance", "Upwork",
     "Design onboarding and core flows for a fitness tracking app in Figma.",
     ["UI/UX Design", "Figma"]),
    ("SEO Content Writer", "freelance", "Fiverr",
     "Write 8-10 SEO-optimized articles per month for a travel blog.",
     ["Content Writing", "SEO"]),
    ("Social Media Marketing Specialist", "freelance", "Upwork",
     "Plan and run paid + organic campaigns for a D2C skincare brand.",
     ["Digital Marketing", "Content Writing", "Graphic Design"]),
    ("Video Editor (YouTube)", "freelance", "Fiverr",
     "Edit weekly long-form videos with captions, b-roll, and thumbnails.",
     ["Video Editing", "Graphic Design"]),
    ("Customer Support Lead", "job", "Indeed",
     "Lead a remote support team; own SLAs, macros, and CSAT reporting.",
     ["Customer Support", "Excel", "Project Management"]),
    ("Full-Stack Developer (Freelance)", "freelance", "Upwork",
     "Ship features end-to-end for an early-stage logistics product.",
     ["React", "Node.js", "SQL"]),
    ("Junior Data Scientist", "job", "Indeed",
     "Support model evaluation and feature analysis under senior mentorship.",
     ["Machine Learning", "Python", "Data Analysis"]),
    ("Flutter Developer - Contract", "freelance", "Upwork",
     "Maintain a cross-platform delivery app and ship two feature sprints.",
     ["Flutter", "JavaScript"]),
    ("Brand Identity Designer", "freelance", "Fiverr",
     "Create logo systems and brand guidelines for startup clients.",
     ["Graphic Design", "Figma"]),
]

# (title, provider, skill, duration)
COURSES = [
    ("Python for Everybody", "Coursera", "Python", "8 weeks"),
    ("Modern JavaScript Bootcamp", "Udemy", "JavaScript", "6 weeks"),
    ("React - The Complete Guide", "Udemy", "React", "7 weeks"),
    ("SQL for Data Analysis", "Mode Analytics", "SQL", "3 weeks"),
    ("Google Data Analytics Certificate", "Google", "Data Analysis", "12 weeks"),
    ("Machine Learning Specialization", "Coursera", "Machine Learning", "10 weeks"),
    ("Google UX Design Certificate", "Google", "UI/UX Design", "12 weeks"),
    ("Figma UI Design Masterclass", "Udemy", "Figma", "4 weeks"),
    ("SEO Fundamentals", "Semrush Academy", "SEO", "2 weeks"),
    ("Digital Marketing Nanodegree", "Udacity", "Digital Marketing", "8 weeks"),
    ("Video Editing with Premiere Pro", "Coursera", "Video Editing", "5 weeks"),
    ("Power BI Desktop Essentials", "Microsoft Learn", "Power BI", "3 weeks"),
    ("Docker Mastery", "Udemy", "Docker", "4 weeks"),
    ("AWS Cloud Practitioner", "AWS Skill Builder", "AWS", "4 weeks"),
    ("Node.js API Development", "freeCodeCamp", "Node.js", "5 weeks"),
    ("Flutter & Dart Bootcamp", "Udemy", "Flutter", "8 weeks"),
]

# skill -> demand score (0-100) for the latest period
DEMAND = {
    "Python": 92, "JavaScript": 90, "React": 88, "SQL": 86, "Data Analysis": 84,
    "Machine Learning": 95, "Node.js": 82, "UI/UX Design": 78, "Figma": 72,
    "Digital Marketing": 76, "SEO": 68, "Content Writing": 64, "Video Editing": 70,
    "WordPress": 58, "Customer Support": 62, "Excel": 74, "Power BI": 71,
    "Docker": 80, "AWS": 85, "Graphic Design": 66, "Project Management": 79,
    "Flutter": 73,
}

DEMAND_PREV = {name: max(40, score - 6) for name, score in DEMAND.items()}


def run(admin_email: str = "admin@skillbridge.dev", admin_password: str = "Admin@123") -> None:
    skills: dict[str, Skill] = {}
    for name in SKILLS:
        skill = Skill.query.filter_by(name=name).first()
        if not skill:
            skill = Skill(name=name)
            db.session.add(skill)
            db.session.flush()
        skills[name] = skill

    for title, type_, source, description, skill_names in OPPORTUNITIES:
        if Opportunity.query.filter_by(title=title).first():
            continue
        opp = Opportunity(title=title, type=type_, source=source, description=description)
        opp.required_skills = [skills[n] for n in skill_names if n in skills]
        db.session.add(opp)

    for title, provider, skill_name, duration in COURSES:
        if Course.query.filter_by(title=title).first():
            continue
        db.session.add(
            Course(
                title=title,
                provider=provider,
                skill_id=skills[skill_name].id if skill_name in skills else None,
                duration=duration,
                url=f"https://example.com/courses/{title.lower().replace(' ', '-')}",
            )
        )

    for period, table in (("2026-Q2", DEMAND_PREV), ("2026-Q3", DEMAND)):
        for name, score in table.items():
            skill = skills.get(name)
            if not skill:
                continue
            stat = DemandStat.query.filter_by(skill_id=skill.id, period=period).first()
            if not stat:
                db.session.add(DemandStat(skill_id=skill.id, demand_score=score, period=period))

    if not User.query.filter_by(email=admin_email).first():
        admin = User(name="SkillBridge Admin", email=admin_email, role="admin")
        admin.set_password(admin_password)
        db.session.add(admin)

    if not User.query.filter_by(email="demo@skillbridge.dev").first():
        demo = User(name="Demo User", email="demo@skillbridge.dev")
        demo.set_password("Demo@123")
        db.session.add(demo)
        db.session.flush()
        for name in ("Python", "SQL", "Data Analysis"):
            demo.skills.append(skills[name])

    db.session.commit()
