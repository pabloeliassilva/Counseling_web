
    let activeCategoryId = 'cv'; 
    let activeConceptId = null;
    const elAppContainer = document.getElementById('main-app-container');
    
    function openSection(type) {
      autoCollapseMenu();
      activeCategoryId = type; 
      
      elAppContainer.classList.remove('show-form', 'show-game', 'show-cv', 'show-blog');
      if (type !== 'enciclopedia') {
          elAppContainer.classList.add('show-' + type);
      }
      
      renderMenu(); 
      if (type === 'enciclopedia') {
          // Lógica de renderConceptos(); (copiada de tu archivo)
      } else if (type === 'blog') {
          renderBlog();
      } else if (type === 'game') {
          // Lógica de iniciar juego
      }
      window.scrollTo(0,0);
    }
    
    // Iniciar
    openSection('cv');
  