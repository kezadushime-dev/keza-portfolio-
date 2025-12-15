// portfolio.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Theme (if using the theme feature)
    if (typeof initializeTheme === 'function') {
        initializeTheme(); 
    }

    // --- Configuration ---
    const CONTACT_FORM_ENDPOINT = 'YOUR_FORMSPREE_OR_FORMSUBMIT_ENDPOINT_HERE'; 
    let currentProjects = []; // Store the full projects array loaded from JSON

    // --- Element References ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.glass-nav a');
    const portfolioContainer = document.querySelector('.projects-grid'); 
    const filterBtns = document.querySelectorAll('.filter-btn');
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('button[type="submit"]');

    // Project Modal Elements (These remain, but the form submission is now non-functional/decorative)
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectModal = document.getElementById('projectModal');
    const closeModalBtn = projectModal ? projectModal.querySelector('.close-button') : null;
    const newProjectForm = document.getElementById('newProjectForm');


    // ----------------------------------------------------
    // 1. Navigation Highlighting & Smooth Scroll
    // ----------------------------------------------------
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Determine current section when scroll position is past section start
            if (scrollY >= (sectionTop - 150)) { // 150px offset
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').endsWith(`#${current}`) && current !== '') {
                link.classList.add('active');
            }
        });
    });


    // ----------------------------------------------------
    // 2. Project Dynamic Loading (from projects.json)
    // ----------------------------------------------------

    /**
     * Fetches projects from the projects.json file and renders them.
     */
    async function loadProjects() {
        if (portfolioContainer) {
            portfolioContainer.innerHTML = '<p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading projects from projects.json...</p>';
        }
        
        try {
            // Fetch data from the local JSON file
            const response = await fetch('projects.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            // Store the data
            currentProjects = await response.json();
            
            // Render the initial set of projects and setup filtering
            renderProjects(currentProjects);
            setupFilter(currentProjects); 

        } catch (error) {
            console.error("Error loading projects from projects.json:", error);
            if (portfolioContainer) {
                 portfolioContainer.innerHTML = '<p class="error-message">Error loading projects. Check that projects.json exists and is valid JSON.</p>';
            }
        }
    }

    /**
     * Renders project cards into the HTML container.
     * @param {Array<Object>} projects - Array of project objects to render.
     */
    function renderProjects(projects) {
        if (!portfolioContainer) return;

        portfolioContainer.innerHTML = '';
        if (projects.length === 0) {
            portfolioContainer.innerHTML = '<p class="no-projects">No projects found matching the criteria.</p>';
            return;
        }

        projects.forEach(project => {
            // Ensure project.tags is an array
            let tagsArray = Array.isArray(project.tags) ? project.tags : 
                            (typeof project.tags === 'string' ? project.tags.split(',').map(tag => tag.trim()).filter(t => t.length > 0) : []);

            // Handle description which might be an array of list items (ul) or a single string (p)
            let descriptionHTML = '';
            if (Array.isArray(project.description)) {
                descriptionHTML = project.description.map(item => `<li>${item}</li>`).join('');
                descriptionHTML = `<ul>${descriptionHTML}</ul>`;
            } else if (project.description) {
                descriptionHTML = `<p>${project.description}</p>`;
            }

            // --- Dynamic Link Generation with styles ---
            let extraLinks = '';

            // Video Link (YouTube style)
            if (project.videoLink) {
                extraLinks += `<a href="${project.videoLink}" target="_blank" class="btn-glass" style="background-color: #ff000030; border-color: #ff0000; color: #ff0000;"><i class="fab fa-youtube"></i> Video Demo</a>`;
            }
            // Presentation Link (Google Blue/PowerPoint style)
            if (project.presentationLink) {
                extraLinks += `<a href="${project.presentationLink}" target="_blank" class="btn-glass" style="background-color: #4285f430; border-color: #4285f4; color: #4285f4;"><i class="fas fa-file-powerpoint"></i> Presentation</a>`;
            }

            const cardHTML = `
                <div class="glass-card project-card" data-category="${project.category}">
                    <img src="${project.image || 'https://via.placeholder.com/400x250?text=Placeholder'}" alt="${project.title} image" loading="lazy">
                    <div class="project-info">
                        <h3>${project.title}</h3>
                        ${descriptionHTML}
                        <div class="tags">
                            ${tagsArray.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                        <div class="project-links-group" style="margin-top: 15px; display: flex; flex-direction: column; gap: 10px;">
                            <a href="${project.link || '#'}" target="_blank" class="btn-glass">View Project <i class="fas fa-external-link-alt"></i></a>
                            ${extraLinks}
                        </div>
                    </div>
                </div>
            `;
            portfolioContainer.innerHTML += cardHTML;
        });
    }
    
    /**
     * Sets up the event listeners for the filter buttons.
     */
    function setupFilter(projects) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');
                const filteredProjects = projects.filter(project => 
                    filterValue === 'all' || project.category === filterValue
                );
                
                renderProjects(filteredProjects);
            });
        });
    }

    // ----------------------------------------------------
    // 3. New Project Submission (JSON - Now Decorative/Non-functional)
    // ----------------------------------------------------

    if (addProjectBtn && projectModal && closeModalBtn && newProjectForm) {
        addProjectBtn.addEventListener('click', () => {
            projectModal.style.display = 'block';
        });

        closeModalBtn.addEventListener('click', () => {
            projectModal.style.display = 'none';
        });
        
        window.addEventListener('click', (event) => {
            if (event.target === projectModal) {
                projectModal.style.display = 'none';
            }
        });

        // NOTE: Since we are using a static projects.json file, 
        // new projects CANNOT be permanently added via frontend JavaScript.
        // This handler is now for demonstration purposes only.
        newProjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = newProjectForm.querySelector('.btn-primary');
            
            const formData = new FormData(newProjectForm);
            const newProjectTitle = formData.get('projectTitle');

            alert(`Project "${newProjectTitle}" simulated submission successful! 
            \nNOTE: Changes were NOT saved permanently because projects are loaded from a static 'projects.json' file.`);
            
            // Simulate success and close modal
            newProjectForm.reset();
            projectModal.style.display = 'none';
            submitBtn.textContent = 'Add to Portfolio'; // Reset button text
            
            // To make it appear, we must manually update the in-memory array and re-render
            const newProjectData = {
                title: newProjectTitle,
                description: formData.get('projectDescription'),
                category: formData.get('projectCategory'),
                tags: formData.get('projectTags').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
                image: formData.get('projectImageLink') || 'https://via.placeholder.com/400x250?text=NEW',
                link: formData.get('projectLink') || '#',
                videoLink: formData.get('projectVideoLink') || null, 
                presentationLink: formData.get('projectPresentationLink') || null, 
            };

            // Add new project to the start of the array and re-render
            currentProjects.unshift(newProjectData); 
            renderProjects(currentProjects);
        });
    }


    // ----------------------------------------------------
    // 4. Contact Form Submission (Existing)
    // ----------------------------------------------------
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            let isValid = true;
            if (!data.name || !data.email || !data.message) {
                alert('Please fill out all required fields.');
                isValid = false;
            }

            if (isValid) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';

                try {
                    const response = await fetch(CONTACT_FORM_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                        },
                        body: formData,
                    });

                    if (response.ok) {
                        alert('Thank you! Your message has been sent successfully.');
                        form.reset();
                    } else {
                        alert('There was an error sending your message. Please try again or contact me directly.');
                        try {
                            console.error('Form submission failed:', await response.json());
                        } catch (e) {
                            console.error('Form submission failed, non-JSON response:', response.statusText);
                        }
                    }
                } catch (error) {
                    alert('A network error occurred. Please try again.');
                    console.error('Network Error:', error);
                } finally {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Message';
                }
            }
        });
    }

    // ----------------------------------------------------
    // 5. Bonus AI Feature Logic (Restored if necessary, otherwise remove this section)
    // ----------------------------------------------------
    function recommendProject() {
        const roleSelect = document.getElementById('user-role');
        const output = document.getElementById('ai-result');

        if(!roleSelect || !output) return; // Exit if elements are missing

        const role = roleSelect.value;
        
        if(!role) {
            output.innerText = "Please select a role first!";
            return;
        }

        output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing your profile...';

        setTimeout(() => {
            let recommendation = "";
            
            if (role === 'developer') {
                recommendation = "Based on your interest in code, I recommend viewing projects tagged with 'Backend' or 'API' in the Web Development category. They feature complex logic.";
            } else if (role === 'designer') {
                recommendation = "As a designer, you will love the projects categorized as 'Design' or 'UI/UX'. They showcase clean typography and modern color theory.";
            } else if (role === 'business') {
                recommendation = "For business impact, check out the 'E-commerce' or 'Data Analysis' projects. They demonstrate high conversion user flows or measurable outcomes.";
            }

            output.innerText = recommendation;
        }, 1500);
    }
    // Make the function globally accessible for the HTML button
    window.recommendProject = recommendProject; 
    
    // Initialize project loading
    loadProjects(); 
});