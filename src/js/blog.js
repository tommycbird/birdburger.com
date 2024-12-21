// src/js/blog.js
// Load in all of the blogs from medium, and display them on the blog page

document.addEventListener('DOMContentLoaded', () => {
    const blogList = document.getElementById('blog-list');

    // Sample filler blog data
    const blogs = [
        {
            title: "Dummy Blog Post",
            text: "This is a post we made about some stuff and the stuff is going all over the place oh goodness...",
            link: "/pages/blog/blog_full.html"
        },
        {
            title: "Another Blog Post",
            text: "Help! I'm trapped in a blog post factory and I can't get out! Oh no!...",
            link: "/pages/blog/blog_full.html"
        },
        {
            title: "Really Good Post",
            text: "This is a really good post. It's good because it's good. It's good because it's good...",
            link: "/pages/blog/blog_full.html"
        }
    ];

    // Function to create blog instance elements
    blogs.forEach(blog => {
        const blogDiv = document.createElement('div');
        blogDiv.classList.add('blog-instance');

        const title = document.createElement('h2');
        title.textContent = blog.title;

        const text = document.createElement('p');
        text.textContent = blog.text;

        const readMore = document.createElement('a');
        readMore.href = blog.link;
        readMore.textContent = "Read more";

        blogDiv.appendChild(title);
        blogDiv.appendChild(text);
        blogDiv.appendChild(readMore);

        blogList.appendChild(blogDiv);
    });
});
