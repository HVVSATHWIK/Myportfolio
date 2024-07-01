document.addEventListener("DOMContentLoaded", () => {
  // Smooth scrolling
  const links = document.querySelectorAll("nav ul li a");
  for (const link of links) {
      link.addEventListener("click", smoothScroll);
  }

  function smoothScroll(event) {
      event.preventDefault();
      const targetId = event.currentTarget.getAttribute("href").substring(1);
      const targetPosition = document.getElementById(targetId).offsetTop;
      window.scrollTo({
          top: targetPosition,
          behavior: "smooth"
      });
  }

  // Form validation (if there's a contact form)
  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
      contactForm.addEventListener("submit", validateForm);
  }

  function validateForm(event) {
      const email = document.querySelector("#email");
      const phone = document.querySelector("#phone");
      let isValid = true;

      if (!validateEmail(email.value)) {
          isValid = false;
          email.classList.add("error");
      } else {
          email.classList.remove("error");
      }

      if (!validatePhone(phone.value)) {
          isValid = false;
          phone.classList.add("error");
      } else {
          phone.classList.remove("error");
      }

      if (!isValid) {
          event.preventDefault();
      }
  }

  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
      const re = /^\+?\d{10,15}$/;
      return re.test(String(phone));
  }
});
