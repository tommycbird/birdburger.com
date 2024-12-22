// src/js/fullblog.js
// Display the full blog post based on the selected article

document.addEventListener('DOMContentLoaded', () => {
    const blogTitle = document.querySelector('main h1');
    const blogContent = document.querySelector('main article');

    // Retrieve the selected article from localStorage
    const selectedArticle = JSON.parse(localStorage.getItem('selectedArticle'));

    if (!selectedArticle) {
        blogTitle.textContent = 'Article Not Found';
        blogContent.innerHTML = '<p>The article you are looking for does not exist.</p>';
        return;
    }

    // Populate the title
    blogTitle.textContent = selectedArticle.title;

    // Populate the content
    // Medium's RSS provides a description with HTML content ? unsure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = selectedArticle.description;

    // Extract the snippet and link
    const snippet = tempDiv.querySelector('.medium-feed-snippet')?.innerHTML || '<p>No content available.</p>';
    const readMoreLink = tempDiv.querySelector('.medium-feed-link a')?.href || '#';

    blogContent.innerHTML = `
        <div class="full-content">
            ${snippet}
            <p><a href="${readMoreLink}" target="_blank">Read the full article on Medium »</a></p>
        </div>
    `;
});
