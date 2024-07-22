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
                skillBar.style.width = `${skill.score}%`;

                skillBarContainer.appendChild(skillBar);
                skillRow.appendChild(skillName);
                skillRow.appendChild(skillBarContainer);
                skillsContainer.appendChild(skillRow);
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

            companies.forEach(company => {
                const companyDiv = document.createElement('div');
                companyDiv.className = 'company';
                companyDiv.innerHTML = `
                    <img src="../images/${company.image}" alt="${company.company_name}">
                    <p>${company.company_name}</p>
                    <p>${company.year_from} - ${company.year_to}</p>
                `;
                container.appendChild(companyDiv);
            });

            // Make the container scrollable by dragging
            let isDown = false;
            let startX;
            let scrollLeft;

            container.addEventListener('mousedown', (e) => {
                isDown = true;
                container.classList.add('active');
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });

            container.addEventListener('mouseleave', () => {
                isDown = false;
                container.classList.remove('active');
            });

            container.addEventListener('mouseup', () => {
                isDown = false;
                container.classList.remove('active');
            });

            container.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 3; //scroll-fast
                container.scrollLeft = scrollLeft - walk;
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
