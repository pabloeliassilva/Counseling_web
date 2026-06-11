
    function renderBlog() {
        const blogContainer = document.getElementById('blog-grid');
        const mockArticles = [
            { title: "La importancia de la escucha activa", date: "Oct 12, 2026", excerpt: "Aprende cómo el silencio puede ser la mejor intervención..." },
            { title: "Autocuidado para Counselors", date: "Sep 28, 2026", excerpt: "Evitando el burnout en la práctica profesional..." }
        ];
        
        blogContainer.innerHTML = mockArticles.map(art => `
            <div style="border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h3 style="color: #e84393; margin-bottom: 10px;">${art.title}</h3>
                <small style="color: #94a3b8; display: block; margin-bottom: 15px;">${art.date}</small>
                <p style="color: #475569; line-height: 1.5;">${art.excerpt}</p>
                <button style="margin-top: 15px; padding: 8px 15px; background: #00B894; color: white; border: none; border-radius: 6px; cursor: pointer;">Leer más</button>
            </div>
        `).join('');
    }
  