document.addEventListener("DOMContentLoaded", async () => {
  const partTypes = ["cpu", "gpu", "motherboard", "cooling", "psu", "storage", "case"];
  const emailDisplay = document.getElementById("email_display");
  let parts = [];

  try {
    const [partsRes, sessionRes] = await Promise.all([
      fetch("/parts"),
      fetch("/session-info")
    ]);

    if (!partsRes.ok || !sessionRes.ok) throw new Error("Failed to load data");

    parts = await partsRes.json();
    const { email } = await sessionRes.json();
    emailDisplay.textContent = email;

    const calculateTotals = () => {
      let totalPrice = 0;
      let totalWatt = 0;

      partTypes.forEach(type => {
        const select = document.getElementById(`${type}_select`);
        const selectedOption = select.selectedOptions[0];
        if (selectedOption && selectedOption.value !== "") {
          totalPrice += parseInt(selectedOption.dataset.price);
          totalWatt += parseInt(selectedOption.dataset.watt);
        }
      });

      document.getElementById("total-price").textContent = "מחיר כולל: ₪" + totalPrice;
      document.getElementById("total-wattage").textContent = "צריכת חשמל: " + totalWatt + "W";
    };

    const populateSelects = () => {
      partTypes.forEach(type => {
        const select = document.getElementById(`${type}_select`);
        select.setAttribute("data-part-type", type);

        const relevantParts = parts.filter(p => p.type === type);

        const defaultOption = document.createElement("option");
        defaultOption.textContent = `בחר ${type}`;
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.value = "";
        select.appendChild(defaultOption);

        relevantParts.forEach(part => {
          const option = document.createElement("option");
          option.value = part.id;
          option.textContent = `${part.name} - ₪${part.price} - ${part.watt}W`;
          option.dataset.price = part.price;
          option.dataset.watt = part.watt;
          select.appendChild(option);
        });

        select.addEventListener("change", () => {
          const selectedOption = select.selectedOptions[0];
          const wattCell = select.parentElement.nextElementSibling;
          const priceCell = wattCell.nextElementSibling;

          wattCell.textContent = selectedOption.dataset.watt + "W";
          priceCell.textContent = "₪" + selectedOption.dataset.price;

          calculateTotals();
        });
      });
    };

    populateSelects();

    fetch(`/last-build?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(savedBuild => {
        if (Array.isArray(savedBuild)) {
          savedBuild.forEach(item => {
            const select = document.getElementById(`${item.partType}_select`);
            if (!select) return;
            const option = Array.from(select.options).find(opt => opt.value == item.partId);
            if (option) {
              option.selected = true;
              const wattCell = select.parentElement.nextElementSibling;
              const priceCell = wattCell.nextElementSibling;
              wattCell.textContent = option.dataset.watt + "W";
              priceCell.textContent = "₪" + option.dataset.price;
            }
          });
          calculateTotals();
        }
      });

    document.getElementById("saveBuildBtn").addEventListener("click", () => {
      const build = [];

      document.querySelectorAll(".select-cell select").forEach(select => {
        const selected = select.options[select.selectedIndex];
        if (selected && selected.value) {
          build.push({
            partType: select.getAttribute("data-part-type") || "unknown",
            partName: selected.textContent,
            partId: selected.value
          });
        }
      });

      if (build.length === 0) {
        alert("לא נבחרו רכיבים לשמירה");
        return;
      }

      fetch("/save-build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, build })
      })
        .then(res => res.json())
        .then(data => {
          if (data.message) {
            alert("ההרכבה נשמרה בהצלחה!");
          } else {
            alert("שגיאה בשמירת ההרכבה.");
          }
        })
        .catch(err => {
          console.error("Error saving build:", err);
          alert("שגיאה בשרת.");
        });
    });

  } catch (err) {
    console.error("Initialization error:", err);
    window.location.href = "/login";
  }
});
