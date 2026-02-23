document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mainNav.classList.contains('active') ? '✕' : '☰';
            menuToggle.textContent = icon;
        });
    }

    // Form Validation (if forms exist)
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            // e.preventDefault();
        });
    });

    // Loan Calculator Logic
    const amountSlider = document.getElementById('amount-slider');
    const termSlider = document.getElementById('term-slider');
    const amountDisplay = document.getElementById('amount-display');
    const termDisplay = document.getElementById('term-display');
    const monthlyPaymentDisplay = document.getElementById('monthly-payment');
    const termResultDisplay = document.getElementById('term-result');
    const totalPaybackDisplay = document.getElementById('total-payback');

    if (amountSlider && termSlider) {
        function calculateLoan() {
            const principal = parseFloat(amountSlider.value);
            const months = parseInt(termSlider.value);
            const rate = 0.10; // 10% fixed rate as per screenshot

            // Simple interest calculation for demo matching the screenshot values roughly
            // Screenshot example: 1000 loan, 54 months, 10% rate?
            // Screenshot: 1000 loan, 54 months -> Total $1245.91. 
            // Interest = 245.91. 
            // Simple Interest = P * r * (t/12) = 1000 * 0.10 * (54/12) = 1000 * 0.1 * 4.5 = 450. NO.
            // Compound Interest? M = P [ i(1 + i)^n ] / [ (1 + i)^n – 1 ]. 
            // Monthly rate i = 0.10 / 12 = 0.008333.
            // M = 1000 * [0.008333 * (1.008333)^54] / [(1.008333)^54 - 1]
            // M = 23.07 (Matches screenshot exactly!).

            const monthlyRate = rate / 12;
            const x = Math.pow(1 + monthlyRate, months);
            const monthly = (principal * x * monthlyRate) / (x - 1);
            const total = monthly * months;

            // Update DOM
            amountDisplay.textContent = `$${principal.toLocaleString()}`;
            termDisplay.textContent = `${months} Months`;
            termResultDisplay.textContent = `${months} Months`;
            monthlyPaymentDisplay.textContent = `$${monthly.toFixed(2)}`;
            totalPaybackDisplay.textContent = `$${total.toFixed(2)}`;
        }

        amountSlider.addEventListener('input', calculateLoan);
        termSlider.addEventListener('input', calculateLoan);

        // Initial calc
        calculateLoan();
    }
});
