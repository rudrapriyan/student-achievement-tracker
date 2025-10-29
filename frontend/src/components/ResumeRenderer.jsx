import React from 'react';
import '../styles/resume.css';

export const ResumeRenderer = ({ resume }) => {
  if (!resume) return null;

  return (
    <div className="resume-container">
      <h1>{resume.personalInfo.name}</h1>
      
      <div className="contact-info">
        {resume.personalInfo.location && <div>{resume.personalInfo.location}</div>}
        {resume.personalInfo.email && <div><a href={`mailto:${resume.personalInfo.email}`}>{resume.personalInfo.email}</a></div>}
        {resume.personalInfo.phone && <div>{resume.personalInfo.phone}</div>}
        {(resume.personalInfo.linkedin || resume.personalInfo.github) && (
          <div>
            {resume.personalInfo.linkedin && <a href={resume.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
            {resume.personalInfo.linkedin && resume.personalInfo.github && ' | '}
            {resume.personalInfo.github && <a href={resume.personalInfo.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
          </div>
        )}
        {resume.personalInfo.portfolio && <div><a href={resume.personalInfo.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a></div>}
      </div>

      {resume.objective && (
        <section>
          <h2>Career Objective</h2>
          <p className="objective">{resume.objective}</p>
        </section>
      )}

      {resume.education && resume.education.length > 0 && (
        <section>
          <h2>Education</h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="education-item">
              <h3>{edu.institution}</h3>
              <p>{edu.degree} {edu.score && `| ${edu.score} ${edu.scoreType}`}</p>
              {edu.dates && <p>{edu.dates}</p>}
            </div>
          ))}
        </section>
      )}

      {resume.technicalSkills && (
        <section className="skills-section">
          <h2>Technical Skills</h2>
          {resume.technicalSkills.languages?.length > 0 && (
            <div className="skills-category">
              <h3>Programming Languages</h3>
              <p>{resume.technicalSkills.languages.join(', ')}</p>
            </div>
          )}
          {resume.technicalSkills.web?.length > 0 && (
            <div className="skills-category">
              <h3>Web Technologies</h3>
              <p>{resume.technicalSkills.web.join(', ')}</p>
            </div>
          )}
          {resume.technicalSkills.frameworksAndTools?.length > 0 && (
            <div className="skills-category">
              <h3>Frameworks & Tools</h3>
              <p>{resume.technicalSkills.frameworksAndTools.join(', ')}</p>
            </div>
          )}
          {resume.technicalSkills.platforms?.length > 0 && (
            <div className="skills-category">
              <h3>Platforms</h3>
              <p>{resume.technicalSkills.platforms.join(', ')}</p>
            </div>
          )}
          {resume.technicalSkills.concepts?.length > 0 && (
            <div className="skills-category">
              <h3>Concepts</h3>
              <p>{resume.technicalSkills.concepts.join(', ')}</p>
            </div>
          )}
        </section>
      )}

      {resume.projects && resume.projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="project-item">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              {(project.githubLink || project.liveLink) && (
                <p>
                  {project.githubLink && <a href={project.githubLink}>GitHub</a>}
                  {project.githubLink && project.liveLink && ' | '}
                  {project.liveLink && <a href={project.liveLink}>Live Demo</a>}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {Array.isArray(resume.certifications) && resume.certifications.length > 0 && (
        <section>
          <h2>Certifications</h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} className="achievement-item">
              <h3>{cert.name}</h3>
              <p>
                {cert.issuer}
                {cert.issuer && cert.date && ' | '} 
                {cert.date}
              </p>
              {cert.url && (
                <p><a href={cert.url} target="_blank" rel="noopener noreferrer">Verify</a></p>
              )}
            </div>
          ))}
        </section>
      )}

      {resume.experience && resume.experience.length > 0 && (
        <section>
          <h2>Experience</h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="experience-item">
              <h3>{exp.role} - {exp.organization}</h3>
              {exp.location && exp.dates && (
                <p>{exp.location} | {exp.dates}</p>
              )}
              <ul>
                {exp.responsibilities.map((resp, i) => (
                  <li key={i}>{resp}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.achievements && resume.achievements.length > 0 && (
        <section>
          <h2>Achievements</h2>
          {resume.achievements.map((achievement, index) => (
            <div key={index} className="achievement-item">
              <h3>{achievement.title}</h3>
              <p>{achievement.event}</p>
              {achievement.details && <p>{achievement.details}</p>}
            </div>
          ))}
        </section>
      )}

      {resume.extraCurricularActivities && resume.extraCurricularActivities.length > 0 && (
        <section>
          <h2>Extra-Curricular Activities</h2>
          {resume.extraCurricularActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <h3>{activity.role}</h3>
              {activity.organization && <p>{activity.organization}</p>}
              {activity.description && <p>{activity.description}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};