// Function to apply the theme based on localStorage value
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('theme-icon').src = '../icons/moon.svg';
        document.getElementById('profile-picture').src = '../images/profile-dark.jpg';
        document.getElementById('hero-section').style.backgroundImage = "url('../images/background-dark.jpg')";
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-icon').src = '../icons/sun.svg';
        document.getElementById('profile-picture').src = '../images/profile-light.jpg';
        document.getElementById('hero-section').style.backgroundImage = "url('../images/background-light.jpg')";
    }
}

// Event listener for theme toggle button
document.getElementById('toggle-theme').addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const themeIcon = document.getElementById('theme-icon');
    const profilePicture = document.getElementById('profile-picture');
    if (isDarkMode) {
        themeIcon.src = '../icons/moon.svg';
        profilePicture.src = '../images/profile-dark.jpg';
        document.getElementById('hero-section').style.backgroundImage = "url('../images/background-dark.jpg')";
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.src = '../icons/sun.svg';
        profilePicture.src = '../images/profile-light.jpg';
        document.getElementById('hero-section').style.backgroundImage = "url('../images/background-light.jpg')";
        localStorage.setItem('theme', 'light');
    }
});

// Apply the theme on page load based on localStorage value
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    // Fetch and parse the CSV file for projects
    Papa.parse('../data/projects.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const projects = results.data;
            const projectsContainer = document.getElementById('projects-container');

            projects.forEach(project => {
                const card = document.createElement('div');
                card.classList.add('project-card');

                if (project.image) {
                    const image = document.createElement('img');
                    image.src = project.image;
                    image.alt = project.title;
                    card.appendChild(image);
                }

                if (project.title) {
                    const title = document.createElement('h3');
                    title.textContent = project.title;
                    card.appendChild(title);
                }

                if (project.description) {
                    const description = document.createElement('p');
                    description.textContent = project.description.length > 100
                        ? project.description.substring(0, 100) + '...'
                        : project.description;
                    card.appendChild(description);
                }

                if (project.link) {
                    const link = document.createElement('a');
                    link.href = project.link;
                    link.textContent = 'View Project';
                    link.target = '_blank';
                    card.appendChild(link);
                }

                projectsContainer.appendChild(card);
            });
        }
    });

    // Fetch and parse the CSV file for skills
    Papa.parse('../data/skills.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const skillsData = results.data;
            const skillsContainer = document.getElementById('skills-container');

            skillsData.forEach(skill => {
                const skillRow = document.createElement('div');
                skillRow.classList.add('skill-row');

                const skillName = document.createElement('div');
                skillName.classList.add('skill-name');
                skillName.textContent = skill.name;

                const skillBarContainer = document.createElement('div');
                skillBarContainer.classList.add('skill-bar-container');

                const skillBar = document.createElement('div');
                skillBar.classList.add('skill-bar');

                skillBarContainer.appendChild(skillBar);
                skillRow.appendChild(skillName);
                skillRow.appendChild(skillBarContainer);
                skillsContainer.appendChild(skillRow);

                // Animate skill bar width
                const observer = new IntersectionObserver(entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            skillBar.style.width = `${skill.score}%`;
                            observer.unobserve(skillBar);
                        }
                    });
                }, { threshold: 0.5 });

                observer.observe(skillBar);
            });
        }
    });

    // Fetch and parse the CSV file for companies
    Papa.parse('../data/companies.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const companies = results.data;
            const container = document.getElementById('companies-container');

            // Clone companies to create a continuous loop
            const cloneCompanies = () => {
                companies.forEach(company => {
                    const companyCard = document.createElement('div');
                    companyCard.className = 'company-card';
                    companyCard.innerHTML = `
                        <img src="../images/${company.image}" alt="${company.company_name}">
                        <p>${company.company_name}</p>
                        <p>${company.year_from} - ${company.year_to}</p>
                    `;
                    container.appendChild(companyCard);
                });
            };

            cloneCompanies();
            cloneCompanies(); // Double the cards to create smooth loop

            // Reset animation on transition end
            container.addEventListener('animationiteration', () => {
                container.appendChild(container.firstElementChild);
                container.style.animation = 'none';
                container.offsetHeight; // Trigger reflow
                container.style.animation = '';
            });
        }
    });
});

// Toggle search input visibility
document.getElementById('search-icon').addEventListener('click', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    searchInput.classList.toggle('visible');
    searchButton.classList.toggle('visible');
    if (searchInput.classList.contains('visible')) {
        searchInput.focus();
    }
});

// Function to handle search and navigate to section
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search-input').value.toLowerCase();
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const textContent = section.textContent.toLowerCase();
        if (textContent.includes(query)) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
    document.getElementById('search-input').classList.remove('visible');
    document.getElementById('search-button').classList.remove('visible');
});

// Also trigger search on pressing Enter key
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('search-button').click();
    }
});
