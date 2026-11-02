/* Ora's Bakery interactive features — menu filtering, gallery lightbox and forms. */
document.addEventListener("DOMContentLoaded", () => {
  // Accessible mobile navigation.
  const toggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#primary-nav");
  if (toggle && navMenu) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navMenu.classList.toggle("is-open", !expanded);
    });
  }

  // Search and category filtering for the menu cards.
  const search = document.querySelector("#menu-search");
  const menuCards = [...document.querySelectorAll(".menu-card")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let activeFilter = "all";
  function filterMenu() {
    if (!menuCards.length) return;
    const term = (search?.value || "").trim().toLowerCase();
    let visible = 0;
    menuCards.forEach(card => {
      const matchesCategory = activeFilter === "all" || card.dataset.category === activeFilter;
      const matchesText = card.textContent.toLowerCase().includes(term);
      card.hidden = !(matchesCategory && matchesText);
      if (!card.hidden) visible++;
    });
    const count = document.querySelector("#menu-count");
    if (count) count.textContent = `${visible} menu item${visible === 1 ? "" : "s"} shown`;
  }
  search?.addEventListener("input", filterMenu);
  filterButtons.forEach(button => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("is-active", item === button));
    filterMenu();
  }));

  // Gallery lightbox using the native dialog element.
  const lightbox = document.querySelector("#lightbox");
  if (lightbox) {
    const lightboxImage = lightbox.querySelector("img");
    const caption = lightbox.querySelector("p");
    document.querySelectorAll(".gallery-item").forEach(button => button.addEventListener("click", () => {
      const image = button.querySelector("img");
      lightboxImage.src = button.dataset.full;
      lightboxImage.alt = image.alt;
      caption.textContent = button.dataset.caption;
      lightbox.showModal();
    }));
    lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) lightbox.close();
    });
  }

  // Shared validation helpers: show an accessible message beside each invalid field.
  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("[required]").forEach(field => {
      const error = form.querySelector(`[data-error-for="${field.id}"]`);
      let message = "";
      if (!field.value.trim()) message = "Please complete this field.";
      else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) message = "Enter a valid email address.";
      else if (field.type === "number" && (Number(field.value) < Number(field.min) || Number(field.value) > Number(field.max))) message = `Enter a number between ${field.min} and ${field.max}.`;
      else if (field.minLength > 0 && field.value.trim().length < field.minLength) message = `Enter at least ${field.minLength} characters.`;
      else if (field.type === "date") {
        const today = new Date(); today.setHours(0,0,0,0);
        const chosen = new Date(`${field.value}T00:00:00`);
        if (chosen < today) message = "Choose today or a future date.";
      }
      if (error) error.textContent = message;
      field.setAttribute("aria-invalid", String(Boolean(message)));
      if (message) valid = false;
    });
    return valid;
  }

  // Enquiry estimate. Amounts match the supplied menu content; custom work is quoted separately.
  const enquiryForm = document.querySelector("#enquiry-form");
  if (enquiryForm) {
    const prices = {bread:18, cakes:250, pastries:17.90, cookies:75, cupcakes:20, beverages:19, custom:null};
    enquiryForm.addEventListener("submit", event => {
      event.preventDefault();
      const result = document.querySelector("#enquiry-result");
      if (!validateForm(enquiryForm)) {
        result.className = "form-result full error-state";
        result.textContent = "Please correct the highlighted fields before continuing.";
        enquiryForm.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const category = enquiryForm.elements.category.value;
      const quantity = Number(enquiryForm.elements.quantity.value);
      if (category === "custom") {
        result.className = "form-result full success";
        result.textContent = `Thank you, ${enquiryForm.elements.name.value}. Custom cakes and platters require an individual quote. Your request for ${quantity} item(s) has been recorded on this page; please use the Contact page to send the details to the bakery. This is not an order confirmation.`;
      } else {
        const estimate = prices[category] * quantity;
        result.className = "form-result full success";
        result.textContent = `Thank you, ${enquiryForm.elements.name.value}. Indicative estimate: R${estimate.toFixed(2)} for ${quantity} item(s). Final price, product choice and collection availability must be confirmed by the bakery. This is not an order confirmation.`;
      }
    });
  }

  // General contact form: validate, then create a mailto message in the visitor's email app.
  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      const result = document.querySelector("#contact-result");
      if (!validateForm(contactForm)) {
        result.className = "form-result full error-state";
        result.textContent = "Please correct the highlighted fields before preparing your email.";
        contactForm.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
      const data = new FormData(contactForm);
      const subject = encodeURIComponent(`Ora's Bakery website: ${data.get("type")}`);
      const body = encodeURIComponent(
        `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nPhone: ${data.get("phone") || "Not supplied"}\n\nMessage:\n${data.get("message")}`
      );
      result.className = "form-result full success";
      result.textContent = "Your details have been validated. Your default email application should open with the message prepared. If it does not, email info@orasbakery101.co.za directly.";
      window.location.href = `mailto:info@orasbakery101.co.za?subject=${subject}&body=${body}`;
    });
    contactForm.addEventListener("reset", () => {
      contactForm.querySelectorAll("[aria-invalid]").forEach(field => field.removeAttribute("aria-invalid"));
      contactForm.querySelectorAll(".error").forEach(error => error.textContent = "");
      const result = document.querySelector("#contact-result");
      if (result) { result.textContent = ""; result.className = "form-result full"; }
    });
  }
});
