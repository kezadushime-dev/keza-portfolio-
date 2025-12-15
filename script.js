// portfolio.js



document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize Theme (if using the theme feature)
    initializeTheme(); 

    // --- Configuration ---
    const CONTACT_FORM_ENDPOINT = 'YOUR_FORMSPREE_OR_FORMSUBMIT_ENDPOINT_HERE'; 
    let currentProjects = []; // Store the projects array in memory

    // --- Element References ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.glass-nav a');
    const portfolioContainer = document.querySelector('.projects-grid'); // Corrected class selector
    const filterBtns = document.querySelectorAll('.filter-btn');
    const form = document.getElementById('contactForm');
    const submitButton = form.querySelector('button[type="submit"]');

    // Project Modal Elements
    const addProjectBtn = document.getElementById('addProjectBtn');
    const projectModal = document.getElementById('projectModal');
    const closeModalBtn = document.querySelector('.close-button');
    const newProjectForm = document.getElementById('newProjectForm');


    // ----------------------------------------------------
    // 1. Navigation Highlighting & Smooth Scroll (Existing)
    // ----------------------------------------------------
    // ... (Existing scroll logic) ...
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 2)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });


    // ----------------------------------------------------
    // 2. Project Dynamic Loading (Now from Firestore)
    // ----------------------------------------------------

    async function loadProjects() {
        portfolioContainer.innerHTML = '<p class="loading-message"><i class="fas fa-spinner fa-spin"></i> Loading projects from database...</p>';
        try {
            // Get data from the 'projects' collection
            const projectsCol = collection(db, 'projects');
            const projectSnapshot = await getDocs(projectsCol);
            
            currentProjects = projectSnapshot.docs.map(doc => ({
                id: doc.id, // Firestore document ID
                ...doc.data() // Project fields (title, category, etc.)
            }));
            
            // Fallback: If Firestore is empty, load hardcoded projects initially (optional)
            if (currentProjects.length === 0) {
                 console.log("Firestore is empty. You may want to populate it with starter data.");
                 // In a real app, you wouldn't typically load JSON if using a DB
            }
            
            renderProjects(currentProjects);
            setupFilter(currentProjects); 

        } catch (error) {
            console.error("Error loading projects from Firestore:", error);
            portfolioContainer.innerHTML = '<p class="error-message">Error loading projects. Check console and Firebase setup.</p>';
        }
    }

    /**
     * Renders project cards into the HTML container.
     */
    function renderProjects(projects) {
        portfolioContainer.innerHTML = '';
        if (projects.length === 0) {
             portfolioContainer.innerHTML = '<p class="no-projects">No projects found in the database. Add one now!</p>';
             return;
        }

        projects.forEach(project => {
            // Ensure project.tags is an array before joining
            const tagsArray = Array.isArray(project.tags) ? project.tags : [project.tags];

            const cardHTML = `
                <div class="project-card glass-card" data-category="${project.category}">
                    <img src="${project.image}" alt="${project.title} screenshot">
                    <div class="card-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="tags">
                            ${tagsArray.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                        <a href="${project.link}" target="_blank" class="cta-link">View Project <i class="fas fa-arrow-right"></i></a>
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
    // 3. New Project Submission (Now with Firestore Persistence)
    // ----------------------------------------------------

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

    newProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = newProjectForm.querySelector('.btn-primary');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        const formData = new FormData(newProjectForm);
        
        const newProjectData = {
            title: formData.get('projectTitle'),
            description: formData.get('projectDescription'),
            category: formData.get('projectCategory'),
            // Split tags into an array for cleaner data storage
            tags: formData.get('projectTags').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0), 
            image: formData.get('projectImageLink') || 'https://via.placeholder.com/400x250?text=New+Project',
            link: formData.get('projectLink') || '#',
            createdAt: new Date() // Add a timestamp for ordering
        };
        
        try {
            // Add the new document to the 'projects' collection in Firestore
            await addDoc(collection(db, "projects"), newProjectData);

            // Success: Close the form and reload projects from the database
            newProjectForm.reset();
            projectModal.style.display = 'none';
            await loadProjects(); // Reloads all projects, including the new one
            
            alert(`Project "${newProjectData.title}" added successfully and saved permanently!`);

        } catch (error) {
            console.error("Error adding document: ", error);
            alert(`Failed to add project: ${error.message}. Check console and security rules.`);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add to Portfolio';
        }
    });


    // ----------------------------------------------------
    // 4. Contact Form Submission (Existing)
    // ----------------------------------------------------
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        // ... (Existing contact form logic) ...
        
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
                    console.error('Form submission failed:', await response.json());
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


    // ----------------------------------------------------
    // 5. Bonus AI Feature Logic (Existing)
    // ----------------------------------------------------
    function recommendProject() {
        // ... (Existing AI logic) ...
        const role = document.getElementById('user-role').value;
        const output = document.getElementById('ai-result');
        
        if(!role) {
            output.innerText = "Please select a role first!";
            return;
        }

        output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing your profile...';

        setTimeout(() => {
            let recommendation = "";
            
            if (role === 'developer') {
                recommendation = "Based on your interest in code, I recommend viewing the 'IoT Health Monitor' in the Robotics section. It features complex backend logic.";
            } else if (role === 'designer') {
                recommendation = "As a designer, you will love the 'Brand Identity Kit'. It showcases clean typography and modern color theory.";
            } else if (role === 'business') {
                recommendation = "For business impact, check out the 'E-commerce Demo'. It demonstrates high conversion user flows.";
            }

            output.innerText = recommendation;
        }, 1500);
    }
    window.recommendProject = recommendProject; 
    
    // Initialize project loading from Firestore
    loadProjects(); 
});