// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenu && mobileMenu.contains(event.target);
        const isClickOnButton = mobileMenuButton && mobileMenuButton.contains(event.target);
        
        if (mobileMenu && !isClickInsideMenu && !isClickOnButton && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
        }
    });
});
