"use client";

import React, { useState, useEffect } from 'react';
import resumeData from '@/app/resume.json';
import html2pdf from 'html2pdf.js';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';

interface ResumeData {
  personal_information: {
    name: string;
    contact_info: string; // Combine phone, email, LinkedIn, GitHub into one field
  };
  education_details: {
    education_level: string;
    institution: string;
    field_of_study: string;
    year_of_completion: string;
  }[];
  projects: {
    name: string;
    description: string;
    link: string;
  }[];
  skills: string[];
  certifications: string[];
  publications: string[];
  experience: {
    position: string;
    company: string;
    location: string;
    employment_period: string;
    bullet_points: string[];
  }[];
}

export default function Home() {
  const [resumeDataState, setResumeDataState] = useState<ResumeData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('resumeData');
    if (storedData) {
      console.log('Loaded data from localStorage');
      setResumeDataState(JSON.parse(storedData));
    } else {
      console.log('Loaded data from resume.json');
      const combinedContactInfo = `${resumeData.personal_information.phone} | ${resumeData.personal_information.email} | ${resumeData.personal_information.linkedin} | ${resumeData.personal_information.github}`;
      const updatedResumeData = {
        ...resumeData,
        personal_information: {
          ...resumeData.personal_information,
          contact_info: combinedContactInfo,
        },
      };
      setResumeDataState(updatedResumeData);
      localStorage.setItem('resumeData', JSON.stringify(updatedResumeData));
    }
  }, []);

  useEffect(() => {
    if (resumeDataState) {
      console.log('Saving data to localStorage');
      localStorage.setItem('resumeData', JSON.stringify(resumeDataState));
    }
  }, [resumeDataState]);

  if (!resumeDataState) {
    return <div>Loading...</div>;
  }

  const { personal_information, education_details, projects, skills, certifications, publications, experience } = resumeDataState;

  const handleDownload = () => {
    console.log('Downloading resume as PDF');
    const element = document.getElementById('resume');
    html2pdf().from(element).save('resume.pdf');
  };

  const handleDoubleClick = (field: string) => {
    console.log(`Double-clicked on field: ${field}`);
    setEditingField(field);
    setIsEditing(true);
  };

  const handleBlur = () => {
    console.log('Blur event');
    setEditingField(null);
    setIsEditing(false);
  };

  const handleChange = (e: ContentEditableEvent, section: string, index?: number, subIndex?: number) => {
    console.log(`Changed field in section: ${section}, index: ${index}, subIndex: ${subIndex}`);
    const updatedData = { ...resumeDataState };
    if (section === 'personal_information') {
      updatedData.personal_information = {
        ...updatedData.personal_information,
        [e.currentTarget.dataset.field as string]: e.currentTarget.innerText,
      };
    } else if (section === 'experience' && index !== undefined) {
      if (subIndex !== undefined) {
        updatedData.experience[index].bullet_points[subIndex] = e.currentTarget.innerText;
      } else {
        const [company, location, employment_period] = e.currentTarget.innerText.split(' | ');
        updatedData.experience[index] = {
          ...updatedData.experience[index],
          company: company.trim(),
          location: location.trim(),
          employment_period: employment_period.trim(),
        };
      }
    } else if (section === 'education_details' && index !== undefined) {
      const [education_level, field_of_study, year_of_completion] = e.currentTarget.innerText.split(' | ');
      updatedData.education_details[index] = {
        ...updatedData.education_details[index],
        education_level: education_level.trim(),
        field_of_study: field_of_study.trim(),
        year_of_completion: year_of_completion.trim(),
      };
    } else if (section === 'projects' && index !== undefined) {
      updatedData.projects[index] = {
        ...updatedData.projects[index],
        [e.currentTarget.dataset.field as string]: e.currentTarget.innerText,
      };
    } else if (section === 'skills' && index !== undefined) {
      updatedData.skills[index] = e.currentTarget.innerText;
    } else if (section === 'certifications' && index !== undefined) {
      updatedData.certifications[index] = e.currentTarget.innerText;
    } else if (section === 'publications' && index !== undefined) {
      updatedData.publications[index] = e.currentTarget.innerText;
    }
    setResumeDataState(updatedData);
  };

  const handleReset = () => {
    console.log('Resetting localStorage and reloading data from resume.json');
    localStorage.removeItem('resumeData');
    const combinedContactInfo = `${resumeData.personal_information.phone} | ${resumeData.personal_information.email} | ${resumeData.personal_information.linkedin} | ${resumeData.personal_information.github}`;
    const updatedResumeData = {
      ...resumeData,
      personal_information: {
        ...resumeData.personal_information,
        contact_info: combinedContactInfo,
      },
    };
    setResumeDataState(updatedResumeData);
    localStorage.setItem('resumeData', JSON.stringify(updatedResumeData));
  };

  const formatContactInfo = (contactInfo: string) => {
    const parts = contactInfo.split(' | ');
    return parts.map((part, index) => {
      if (part.includes('@')) {
        return <a key={index} href={`mailto:${part}`} className="text-blue-500">{part}</a>;
      } else if (part.includes('linkedin.com')) {
        return <a key={index} href={part} className="text-blue-500">{part}</a>;
      } else if (part.includes('github.com')) {
        return <a key={index} href={part} className="text-blue-500">{part}</a>;
      } else {
        return <span key={index}>{part}</span>;
      }
    }).reduce((prev, curr) => <>{prev} | {curr}</>);
  };

  return (
    <div>
      <button onClick={handleDownload} className="mb-4 p-2 bg-blue-500 text-white rounded">Download Resume as PDF</button>
      <button onClick={handleReset} className="mb-4 p-2 bg-red-500 text-white rounded ml-2">Reset Data</button>
      <div id="resume" className="p-10 mx-auto my-10 border border-black w-[210mm] min-h-[297mm] break-after-page">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            <ContentEditable
              html={personal_information.name}
              disabled={!(isEditing && editingField === 'name')}
              onChange={(e) => handleChange(e, 'personal_information')}
              onDoubleClick={() => handleDoubleClick('name')}
              onBlur={handleBlur}
              data-field="name"
              className="inline-block w-auto"
            />
          </h1>
          <div className="mt-2">
            <ContentEditable
              html={personal_information.contact_info}
              disabled={!(isEditing && editingField === 'contact_info')}
              onChange={(e) => handleChange(e, 'personal_information')}
              onDoubleClick={() => handleDoubleClick('contact_info')}
              onBlur={handleBlur}
              data-field="contact_info"
              className="inline-block w-auto"
            />
          </div>
        </div>

        <section className="mb-8 relative group">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 mb-4">Experience</h2>
          {experience.map((job, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold">
                <ContentEditable
                  html={job.position}
                  disabled={!(isEditing && editingField === `experience_position_${index}`)}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  onDoubleClick={() => handleDoubleClick(`experience_position_${index}`)}
                  onBlur={handleBlur}
                  data-field="position"
                  className="inline-block w-auto"
                />
              </h3>
              <div className="italic">
                <ContentEditable
                  html={`${job.company}, ${job.location} | ${job.employment_period}`}
                  disabled={!(isEditing && editingField === `experience_company_details_${index}`)}
                  onChange={(e) => handleChange(e, 'experience', index)}
                  onDoubleClick={() => handleDoubleClick(`experience_company_details_${index}`)}
                  onBlur={handleBlur}
                  data-field="company_details"
                  className="inline-block w-auto"
                />
              </div>
              <ul className="list-none list-inside mt-2 space-y-1">
                {job.bullet_points.map((point, idx) => (
                  <li key={idx} className="ml-4">
                    <ContentEditable
                      html={point}
                      disabled={!(isEditing && editingField === `experience_bullet_points_${index}_${idx}`)}
                      onChange={(e) => handleChange(e, 'experience', index, idx)}
                      onDoubleClick={() => handleDoubleClick(`experience_bullet_points_${index}_${idx}`)}
                      onBlur={handleBlur}
                      data-field="bullet_points"
                      className="inline-block w-auto"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mb-8 relative group">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 mb-4">Projects</h2>
          {projects.map((project, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold">
                <ContentEditable
                  html={project.name}
                  disabled={!(isEditing && editingField === `projects_name_${index}`)}
                  onChange={(e) => handleChange(e, 'projects', index)}
                  onDoubleClick={() => handleDoubleClick(`projects_name_${index}`)}
                  onBlur={handleBlur}
                  data-field="name"
                  className="inline-block w-auto"
                />
              </h3>
              <div className="italic">
                <ContentEditable
                  html={project.description}
                  disabled={!(isEditing && editingField === `projects_description_${index}`)}
                  onChange={(e) => handleChange(e, 'projects', index)}
                  onDoubleClick={() => handleDoubleClick(`projects_description_${index}`)}
                  onBlur={handleBlur}
                  data-field="description"
                  className="inline-block w-auto"
                /> | <a href={project.link} className="text-blue-500">
                  <ContentEditable
                    html={project.link}
                    disabled={!(isEditing && editingField === `projects_link_${index}`)}
                    onChange={(e) => handleChange(e, 'projects', index)}
                    onDoubleClick={() => handleDoubleClick(`projects_link_${index}`)}
                    onBlur={handleBlur}
                    data-field="link"
                    className="inline-block w-auto"
                  />
                </a>
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 relative group">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 mb-4">Education</h2>
          {education_details.map((education, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold">
                <ContentEditable
                  html={education.institution}
                  disabled={!(isEditing && editingField === `education_details_institution_${index}`)}
                  onChange={(e) => handleChange(e, 'education_details', index)}
                  onDoubleClick={() => handleDoubleClick(`education_details_institution_${index}`)}
                  onBlur={handleBlur}
                  data-field="institution"
                  className="inline-block w-auto"
                />
              </h3>
              <div className="italic">
                <ContentEditable
                  html={`${education.education_level} in ${education.field_of_study} | ${education.year_of_completion}`}
                  disabled={!(isEditing && editingField === `education_details_${index}`)}
                  onChange={(e) => handleChange(e, 'education_details', index)}
                  onDoubleClick={() => handleDoubleClick(`education_details_${index}`)}
                  onBlur={handleBlur}
                  data-field="education_details"
                  className="inline-block w-auto"
                />
              </div>
            </div>
          ))}
        </section>

        <section className="mb-8 relative group">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 mb-4">Technical Skills</h2>
          <div className="ml-4">
            <ContentEditable
              html={skills.join(', ')}
              disabled={!(isEditing && editingField === 'skills')}
              onChange={(e) => handleChange(e, 'skills')}
              onDoubleClick={() => handleDoubleClick('skills')}
              onBlur={handleBlur}
              data-field="skills"
              className="inline-block w-auto"
            />
          </div>
        </section>

        <section className="mb-8 relative group">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 mb-4">Certifications and Publications</h2>
          <div className="flex justify-between">
            <div className="w-1/2 pr-4">
              <ul className="list-disc list-inside mt-2">
                {certifications.map((certification, index) => (
                  <li key={index} className="ml-4">
                    <ContentEditable
                      html={certification}
                      disabled={!(isEditing && editingField === `certifications_${index}`)}
                      onChange={(e) => handleChange(e, 'certifications', index)}
                      onDoubleClick={() => handleDoubleClick(`certifications_${index}`)}
                      onBlur={handleBlur}
                      data-field="certifications"
                      className="inline-block w-auto"
                    />
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-1/2 pl-4">
              {/* <h3 className="text-xl font-semibold">Publications</h3> */}
              <ul className="list-disc list-inside mt-2">
                {publications.map((publication, index) => (
                  <li key={index} className="ml-4">
                    <ContentEditable
                      html={publication}
                      disabled={!(isEditing && editingField === `publications_${index}`)}
                      onChange={(e) => handleChange(e, 'publications', index)}
                      onDoubleClick={() => handleDoubleClick(`publications_${index}`)}
                      onBlur={handleBlur}
                      data-field="publications"
                      className="inline-block w-auto"
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}