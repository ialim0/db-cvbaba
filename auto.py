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
            "relevant_coursework": 0.4  # 40% chance of including coursework
        }
        self.photo_patterns = [
            "https://randomuser.me/api/portraits/{gender}/{id}.jpg",
            "https://headshots.example.com/{gender}/{id}",
            "https://profile.pics/{gender}/{id}"
        ]

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

    def generate_skills(self, industry):
        available_skills = self.skills[industry]
        num_skills = random.randint(3, min(len(available_skills), 6))  # Ensure max does not exceed available skills
        return ", ".join(random.sample(available_skills, num_skills))

    def generate_education(self, force_complete=False, include=True):
        if not include:  # Skip education entirely
            return None

        num_degrees = random.randint(1, 3) if force_complete else random.choices([1, 2], [0.6, 0.4])[0]
        education_list = []

        for _ in range(num_degrees):
            degree = random.choice(self.degrees)
            university = random.choice(self.universities)
            graduation_date = self.generate_date(2005, 2020)
            coursework = ""
            distinction = ""

            # Ensure coursework for complete resumes or include in 40% of resumes
            if force_complete or random.random() < self.weights["relevant_coursework"]:
                coursework = f" (Relevant coursework: {', '.join(random.sample(['Data Structures', 'AI/ML', 'Algorithms', 'Operating Systems', 'Database Management'], k=3))})"

            # Include distinctions for complete resumes or in 10% of other resumes
            if force_complete or random.random() < 0.1:
                distinction = f" ({random.choice(self.distinctions)})"

            education_entry = f"{degree}, {university}, {graduation_date}{distinction}{coursework}"
            education_list.append(education_entry)
        
        return education_list

    def generate_experience(self, force_complete=False, include=True):
        if not include:  # Skip experience entirely
            return None

        num_positions = random.randint(1, 4) if force_complete else random.randint(1, 3)
        experiences = []
        for _ in range(num_positions):
            job_title = random.choice(self.job_titles)
            company = f"{random.choice(['Tech', 'Global', 'Health', 'Retail', 'Innovations'])} {random.choice(['Corp', 'Solutions', 'Enterprises', 'Inc.'])}"
            start_date = self.generate_date(2010, 2018)
            end_date = self.generate_date(2019, 2023)
            achievements = [
                f"Led development of {random.choice(['a scalable API', 'a mobile app', 'cloud migration'])}, improving {random.choice(['performance', 'user engagement'])} by {random.randint(20, 50)}%",
                f"Managed a team of {random.randint(3, 10)} engineers to deliver a {random.choice(['key milestone', 'final product'])}"
            ]
            experiences.append({
                "Title": job_title,
                "Company": company,
                "Period": f"{start_date} - {end_date}",
                "Achievements": achievements
            })
        return experiences

    def generate_projects(self, force_complete=False):
        if not force_complete and random.random() < 0.3:  # 30% chance of skipping projects
            return None

        num_projects = random.randint(2, 4) if force_complete else random.randint(1, 3)
        project_list = []
        for _ in range(num_projects):
            project = random.choice(self.projects)
            tech_stack = ", ".join(random.sample(
                ["Python", "React", "Docker", "Kubernetes", "SQL", "AWS"], k=random.randint(2, 5)
            ))
            project_year = self.generate_date(2018, 2023)
            project_list.append(
                f"{project} (Technologies: {tech_stack}, Year: {project_year})"
            )
        return project_list

    def generate_certifications(self, force_complete=False):
        if not force_complete and random.random() < 0.5:  # 50% chance of skipping certifications
            return None

        return random.sample(self.certifications, random.randint(1, 3) if force_complete else random.randint(1, 2))

    def generate_research(self, force_complete=False):
        if not force_complete and random.random() < 0.7:  # 70% chance of skipping research
            return None

        num_research = random.randint(1, 2)
        research_list = []
        for _ in range(num_research):
            research_topic = random.choice([
                "Neural Network Optimization", "User Interface Design Patterns", 
                "Big Data Analysis", "IoT System Security"
            ])
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

        industry = random.choice(self.industries)
        name = f"{random.choice(self.first_names)} {random.choice(self.last_names)}"
        email = f"{name.lower().replace(' ', '.')}@example.com"
        phone = f"{random.randint(100,999)}-{random.randint(100,999)}-{random.randint(1000,9999)}"
        linkedin = f"linkedin.com/in/{name.lower().replace(' ', '')}"
        photo = self.generate_photo()
        education = self.generate_education(force_complete, include_education)
        experience = self.generate_experience(force_complete, include_experience)
        skills = self.generate_skills(industry)
        projects = self.generate_projects(force_complete)
        certifications = self.generate_certifications(force_complete)
        research = self.generate_research(force_complete)

        prompt = random.choice(self.prompts)

        resume = {
            "Prompt": prompt,
            "Style": random.choice(self.styles),
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

