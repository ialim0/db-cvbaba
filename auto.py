import random
from datetime import datetime, timedelta


class BalancedResumeDataGenerator:
    def __init__(self):
        self.first_names = ["Emma", "Liam", "Olivia", "Noah", "Ava"]
        self.last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones"]
        self.job_titles = ["Software Engineer", "Data Scientist", "Project Manager", "UX Designer", "DevOps Engineer"]
        self.industries = ["Tech", "Design", "Management"]
        self.skills = {
            "Tech": ["Python", "TypeScript", "React", "Node.js", "Docker", "Kubernetes", "SQL"],
            "Design": ["Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator"],
            "Management": ["Agile", "Scrum", "Project Planning", "Team Leadership"]
        }
        self.certifications = [
            "AWS Certified Solutions Architect",
            "Certified Scrum Master (CSM)",
            "Google Professional Cloud Architect",
            "Certified Kubernetes Administrator (CKA)"
        ]
        self.projects = [
            "E-commerce Platform", "Analytics Dashboard", "Machine Learning Model",
            "Mobile Application", "DevOps Pipeline"
        ]
        self.degrees = ["M.S. Computer Science", "B.S. Software Engineering", "Ph.D. Data Science", "B.A. Graphic Design"]
        self.universities = ["Stanford University", "MIT", "Harvard", "Oxford", "Carnegie Mellon"]
        self.distinctions = ["Summa Cum Laude", "Magna Cum Laude", "With Honors"]
        self.styles = ["Minimalist", "Modern", "Creative"]
        self.prompts = [
            "Please emphasize my work experience and show the impact of my achievements.",
            "Focus on showcasing my academic background, including coursework and GPA.",
            "Can you highlight my technical skills and certifications prominently?",
            "I want to balance my education, experience, and skills effectively.",
            "Make the resume stand out for creative roles with a visually appealing design.",
            "Can you focus on my leadership roles and achievements in managing teams?",
            "Include a section on my research and academic publications, if any.",
            "Ensure my projects and technical skills are front and center."
        ]
        self.weights = {
            "complete_resume": 0.5,  # 50% with all fields filled
            "no_experience": 0.2,    # 20% with experience missing
            "no_education": 0.15,    # 15% with education missing
            "balanced": 0.15,        # 15% balanced resumes
            "photo": 0.4,            # 40% chance of including a photo
            "relevant_coursework": 0.4,  # 40% chance of including coursework
            "fine_tune_job_description": 0.7  # 70% chance of including a Fine Tune Job Description
        }
        self.photo_patterns = [
            "https://randomuser.me/api/portraits/{gender}/{id}.jpg",
            "https://headshots.example.com/{gender}/{id}",
            "https://profile.pics/{gender}/{id}"
        ]
        self.fine_tune_job_descriptions = {
            "Software Engineer": [
                "We are seeking a Software Engineer proficient in Python and JavaScript to develop scalable web applications.",
                "Looking for a Software Engineer to join our dynamic team, focusing on backend services and API development."
            ],
            "Data Scientist": [
                "Seeking a Data Scientist with expertise in machine learning and statistical modeling to analyze complex datasets.",
                "We require a Data Scientist to build predictive models and derive actionable insights from large datasets."
            ],
            "Project Manager": [
                "Hiring a Project Manager experienced in Agile methodologies to lead cross-functional teams.",
                "Looking for a Project Manager to oversee project planning and ensure timely delivery."
            ],
            "UX Designer": [
                "We need a UX Designer to create intuitive user interfaces and enhance user experience.",
                "Seeking a UX Designer skilled in wireframing and prototyping for mobile and web applications."
            ],
            "DevOps Engineer": [
                "Looking for a DevOps Engineer to automate deployment pipelines and manage cloud infrastructure.",
                "Hiring a DevOps Engineer experienced in CI/CD tools to improve our development workflow."
            ],
            # Add more job titles and their job descriptions as needed
        }
        self.required_skills_per_job = {
            "Software Engineer": ["Python", "JavaScript", "API development", "Backend", "Django", "Flask"],
            "Data Scientist": ["Machine Learning", "Statistical Modeling", "Data Analysis", "Python", "R", "TensorFlow"],
            "Project Manager": ["Agile", "Scrum", "Project Planning", "Leadership", "Budgeting", "Risk Management"],
            "UX Designer": ["User Interfaces", "User Experience", "Wireframing", "Prototyping", "Figma", "Sketch"],
            "DevOps Engineer": ["CI/CD", "Automation", "Cloud Infrastructure", "Deployment Pipelines", "Docker", "Kubernetes"],
            # Add more as needed
        }

    def generate_date(self, start_year=2010, end_year=2023):
        start_date = datetime(start_year, 1, 1)
        end_date = datetime(end_year, 12, 31)
        random_days = random.randint(0, (end_date - start_date).days)
        return (start_date + timedelta(days=random_days)).strftime("%Y-%m")

    def generate_photo(self):
        """
        Generate a photo URL with 40% probability, otherwise return None.
        """
        if random.random() < self.weights["photo"]:
            pattern = random.choice(self.photo_patterns)
            gender = random.choice(["men", "women"])
            photo_id = random.randint(1, 99)
            return pattern.format(gender=gender, id=photo_id)
        return None

    def generate_skills(self, industry, target_job_title=None, confidence_meter=None):
        available_skills = self.skills[industry]
        num_skills = random.randint(3, min(len(available_skills), 6))
        selected_skills = random.sample(available_skills, num_skills)
        
        # Adjust skills based on Confidence Meter
        if target_job_title and confidence_meter:
            required_skills = self.required_skills_per_job.get(target_job_title, [])
            num_required_skills = int((confidence_meter / 100) * len(required_skills))
            num_required_skills = min(num_required_skills, len(required_skills))
            # Include required skills
            selected_skills = random.sample(required_skills, num_required_skills) + selected_skills
            # Remove duplicates and limit to maximum number of skills
            selected_skills = list(dict.fromkeys(selected_skills))[:num_skills]
        
        return ", ".join(selected_skills)

    def generate_education(self, force_complete=False, include=True, target_job_title=None, confidence_meter=None):
        if not include:  
            return None

        num_degrees = random.randint(1, 3) if force_complete else random.choices([1, 2], [0.6, 0.4])[0]
        education_list = []

        for _ in range(num_degrees):
            degree = random.choice(self.degrees)
            university = random.choice(self.universities)
            graduation_date = self.generate_date(2005, 2020)
            coursework = ""
            distinction = ""

            if force_complete or random.random() < self.weights["relevant_coursework"]:
                coursework_list = ['Data Structures', 'AI/ML', 'Algorithms', 'Operating Systems', 'Database Management']
                # Adjust coursework based on Confidence Meter
                if target_job_title and confidence_meter:
                    required_skills = self.required_skills_per_job.get(target_job_title, [])
                    num_required_courses = int((confidence_meter / 100) * len(required_skills))
                    required_courses = random.sample(required_skills, min(num_required_courses, len(required_skills)))
                    coursework_list = list(set(coursework_list + required_courses))
                coursework = f" (Relevant coursework: {', '.join(random.sample(coursework_list, k=3))})"

            if force_complete or random.random() < 0.1:
                distinction = f" ({random.choice(self.distinctions)})"

            education_entry = f"{degree}, {university}, {graduation_date}{distinction}{coursework}"
            education_list.append(education_entry)
        
        return education_list

    def generate_experience(self, force_complete=False, include=True, target_job_title=None, confidence_meter=None):
        if not include: 
            return None

        num_positions = random.randint(1, 4) if force_complete else random.randint(1, 3)
        experiences = []
        for _ in range(num_positions):
            if target_job_title and confidence_meter and random.random() < (confidence_meter / 100):
                job_title = target_job_title
            else:
                job_title = random.choice(self.job_titles)
            company = f"{random.choice(['Tech', 'Global', 'Health', 'Retail', 'Innovations'])} {random.choice(['Corp', 'Solutions', 'Enterprises', 'Inc.'])}"
            start_date = self.generate_date(2010, 2018)
            end_date = self.generate_date(2019, 2023)
            achievements = [
                f"Led development of {random.choice(['a scalable API', 'a mobile app', 'cloud migration'])}, improving {random.choice(['performance', 'user engagement'])} by {random.randint(20, 50)}%",
                f"Managed a team of {random.randint(3, 10)} engineers to deliver a {random.choice(['key milestone', 'final product'])}"
            ]
            # Adjust achievements to include required skills or keywords
            if target_job_title and confidence_meter:
                required_keywords = self.required_skills_per_job.get(target_job_title, [])
                num_keywords = int((confidence_meter / 100) * len(required_keywords))
                keywords_included = random.sample(required_keywords, min(num_keywords, len(required_keywords)))
                # Add keywords to achievements
                achievements.extend([f"Utilized {keyword} to achieve project goals." for keyword in keywords_included])
            experiences.append({
                "Title": job_title,
                "Company": company,
                "Period": f"{start_date} - {end_date}",
                "Achievements": achievements
            })
        return experiences

    def generate_projects(self, force_complete=False, target_job_title=None, confidence_meter=None):
        if not force_complete and random.random() < 0.3:  
            return None

        num_projects = random.randint(2, 4) if force_complete else random.randint(1, 3)
        project_list = []
        for _ in range(num_projects):
            project = random.choice(self.projects)
            tech_options = ["Python", "React", "Docker", "Kubernetes", "SQL", "AWS"]
            # Adjust tech stack based on Confidence Meter
            if target_job_title and confidence_meter:
                required_skills = self.required_skills_per_job.get(target_job_title, [])
                num_required_skills = int((confidence_meter / 100) * len(required_skills))
                tech_stack = random.sample(required_skills, min(num_required_skills, len(required_skills)))
                # Fill the rest with random tech options
                remaining_tech = random.sample(tech_options, random.randint(0, 3))
                tech_stack.extend(remaining_tech)
                tech_stack = list(dict.fromkeys(tech_stack))
            else:
                tech_stack = random.sample(tech_options, random.randint(2, 5))
            project_year = self.generate_date(2018, 2023)
            project_list.append(
                f"{project} (Technologies: {', '.join(tech_stack)}, Year: {project_year})"
            )
        return project_list

    def generate_certifications(self, force_complete=False, target_job_title=None, confidence_meter=None):
        if not force_complete and random.random() < 0.5: 
            return None

        certifications_list = self.certifications.copy()
        if target_job_title and confidence_meter:
            required_skills = self.required_skills_per_job.get(target_job_title, [])
            # Assume certifications that match required skills
            certifications_list.extend([f"Certification in {skill}" for skill in required_skills])
        
        return random.sample(certifications_list, random.randint(1, 3) if force_complete else random.randint(1, 2))

    def generate_research(self, force_complete=False, target_job_title=None, confidence_meter=None):
        if not force_complete and random.random() < 0.7: 
            return None

        num_research = random.randint(1, 2)
        research_list = []
        for _ in range(num_research):
            research_topic = random.choice([
                "Neural Network Optimization", "User Interface Design Patterns", 
                "Big Data Analysis", "IoT System Security"
            ])
            if target_job_title and confidence_meter and random.random() < (confidence_meter / 100):
                required_topics = self.required_skills_per_job.get(target_job_title, [])
                if required_topics:
                    research_topic = f"Research on {random.choice(required_topics)}"
            publication_year = self.generate_date(2015, 2022)
            research_list.append(
                f"{research_topic} (Published in {publication_year})"
            )
        return research_list

    def generate_resume(self):
        distribution_choice = random.choices(
            ["complete", "no_experience", "no_education", "balanced"],
            weights=[self.weights["complete_resume"], self.weights["no_experience"], self.weights["no_education"], self.weights["balanced"]],
            k=1
        )[0]

        force_complete = distribution_choice == "complete"
        include_experience = distribution_choice != "no_experience"
        include_education = distribution_choice != "no_education"

        # Decide whether to include the Fine Tune Job Description
        fine_tune_job_description = None
        confidence_meter = None
        if random.random() < self.weights["fine_tune_job_description"]:
            # Select a target job title
            target_job_title = random.choice(self.job_titles)
            fine_tune_job_description = random.choice(self.fine_tune_job_descriptions.get(
                target_job_title,
                ["We are seeking a professional to fill a challenging role in our team."]
            ))
            confidence_meter = random.randint(70, 100)  # Confidence level between 70% and 100%
        else:
            target_job_title = None
            confidence_meter = None

        industry = random.choice(self.industries)
        name = f"{random.choice(self.first_names)} {random.choice(self.last_names)}"
        email = f"{name.lower().replace(' ', '.')}@example.com"
        phone = f"{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
        linkedin = f"linkedin.com/in/{name.lower().replace(' ', '')}"
        photo = self.generate_photo()
        education = self.generate_education(force_complete, include_education, target_job_title, confidence_meter)
        experience = self.generate_experience(force_complete, include_experience, target_job_title, confidence_meter)
        skills = self.generate_skills(industry, target_job_title, confidence_meter)
        projects = self.generate_projects(force_complete, target_job_title, confidence_meter)
        certifications = self.generate_certifications(force_complete, target_job_title, confidence_meter)
        research = self.generate_research(force_complete, target_job_title, confidence_meter)

        prompt = random.choice(self.prompts)

        resume = {
            "Prompt": prompt,
            "Style": random.choice(self.styles),
            "Fine Tune Job Description": fine_tune_job_description,
            "Confidence Meter": confidence_meter,
            "User Profile": {
                "Name": name,
                "Email": email,
                "Phone": phone,
                "LinkedIn": linkedin,
                "Photo": photo,
                "Education": education,
                "Skills": skills,
                "Experience": experience,
                "Projects": projects,
                "Certifications": certifications,
                "Research": research
            }
        }
        return resume

    def save_to_txt(self, resumes, filename="resume_data.txt"):
        try:
            with open(filename, "w", encoding="utf-8") as file:
                for resume in resumes:
                    user_profile = resume["User Profile"]
                    file.write(f"Prompt: {resume['Prompt']}\n")
                    file.write(f"Style: {resume['Style']}\n\n")
                    # Include the Fine Tune Job Description if it exists
                    if resume.get("Fine Tune Job Description"):
                        file.write("Fine Tune Job Description:\n")
                        file.write(f"{resume['Fine Tune Job Description']}\n")
                        file.write(f"Confidence Meter: {resume['Confidence Meter']}%\n\n")
                    file.write("User Profile:\n")
                    file.write(f"Name: {user_profile['Name']}\n")
                    file.write(f"Email: {user_profile['Email']}\n")
                    file.write(f"Phone: {user_profile['Phone']}\n")
                    file.write(f"LinkedIn: {user_profile['LinkedIn']}\n")
                    if user_profile["Photo"]:
                        file.write(f"Photo: {user_profile['Photo']}\n")
                    if user_profile["Education"]:
                        file.write("Education:\n")
                        for edu in user_profile["Education"]:
                            file.write(f"- {edu}\n")
                    file.write(f"Skills: {user_profile['Skills']}\n")
                    if user_profile["Experience"]:
                        file.write("Experience:\n")
                        for exp in user_profile["Experience"]:
                            file.write(f"- {exp['Title']} at {exp['Company']} ({exp['Period']})\n")
                            for achievement in exp["Achievements"]:
                                file.write(f"  - {achievement}\n")
                    if user_profile["Projects"]:
                        file.write("Projects:\n")
                        for proj in user_profile["Projects"]:
                            file.write(f"- {proj}\n")
                    if user_profile["Certifications"]:
                        file.write("Certifications:\n")
                        for cert in user_profile["Certifications"]:
                            file.write(f"- {cert}\n")
                    if user_profile["Research"]:
                        file.write("Research:\n")
                        for res in user_profile["Research"]:
                            file.write(f"- {res}\n")
                    file.write("\n" + "-" * 50 + "\n\n")
            return f"Resumes saved to {filename}"
        except Exception as e:
            return f"Error: {e}"


# Main Execution
if __name__ == "__main__":
    generator = BalancedResumeDataGenerator()
    resumes = [generator.generate_resume() for _ in range(10)]
    result = generator.save_to_txt(resumes, "resume_data.txt")
    print(result)
