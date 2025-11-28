document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Navigation Highlighting & Smooth Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.glass-nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
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

    // 2. Project Filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // 3. Contact Form Validation (Simple)
    const form = document.getElementById('contactForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('input, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.border = "1px solid red";
            } else {
                input.style.border = "none";
            }
        });

        if (isValid) {
            alert('Message Sent! (This is a demo)');
            form.reset();
        }
    });
});

// 4. Bonus AI Feature Logic
function recommendProject() {
    const role = document.getElementById('user-role').value;
    const output = document.getElementById('ai-result');
    
    if(!role) {
        output.innerText = "Please select a role first!";
        return;
    }

    output.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing your profile...';

    // Simulate AI thinking time
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