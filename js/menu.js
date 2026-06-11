
    let isMenuCollapsed = true;
    function toggleMenu() {
        isMenuCollapsed = !isMenuCollapsed;
        document.getElementById('sidebar-menu').classList.toggle('collapsed', isMenuCollapsed);
    }
    function autoCollapseMenu() {
        if (!isMenuCollapsed && window.innerWidth > 768) {
            isMenuCollapsed = true;
            document.getElementById('sidebar-menu').classList.add('collapsed');
        }
    }
    function renderMenu() {
      const elList = document.getElementById('list-categorias');
      const items = [
          { id: 'cv', icon: '🌸', title: 'Lilian B. Romano', desc: 'COUNSELOR', color: '#e84393' },
          { id: 'enciclopedia', icon: '📚', title: 'ENCICLOPEDIA', desc: 'Lista de Conceptos', color: '#00B894' },
          { id: 'blog', icon: '📝', title: 'NUEVO BLOG', desc: 'Artículos', color: '#f39c12' },
          { id: 'game', icon: '🎮', title: 'COUNSELOR PLAY', desc: '¡Juguemos!', color: '#9b59b6' }
      ];
      elList.innerHTML = items.map(i => `
        <div class="cat-card ${activeCategoryId === i.id ? 'active' : ''}" style="--cat-color: ${i.color}; border-color: ${activeCategoryId === i.id ? i.color : '#e2e8f0'};" onclick="openSection('${i.id}')">
            <div class="cat-icon" style="background:${i.color}">${i.icon}</div>
            <div class="cat-text-content">
                <div class="cat-title">${i.title}</div>
                <div class="cat-desc">${i.desc}</div>
            </div>
        </div>`).join('');
    }
  