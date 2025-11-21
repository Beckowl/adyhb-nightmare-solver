document.addEventListener("DOMContentLoaded", function () {
    fetch("notes.json")
        .then(r => r.json())
        .then(data => {
            const idMap = Object.fromEntries(data.map(n => [n.id, n.content]));
            const ids = Object.keys(idMap);

            document.querySelectorAll(".note-input").forEach(input => {
                new Awesomplete(input, {
                    list: ids,
                    minChars: 0,
                    autoFirst: true,
                    tabSelect: true
                });

                input.addEventListener("focus", () => {
                    input.value = input.value;
                    input.dispatchEvent(new Event("input"));
                });

                input.addEventListener("awesomplete-selectcomplete", () => {
                    updateMaxIndex(input.closest(".field"));
                    updateOutput();
                });

                input.addEventListener("blur", updateAll);
                input.addEventListener("keydown", e => {
                    if (e.key === "Enter" || e.key === "Tab") {
                        updateMaxIndex(input.closest(".field"));
                        updateOutput();
                    }
                });
            });

            document.querySelectorAll(".len-input").forEach(lenInput => {
                lenInput.addEventListener("input", updateOutput);
                lenInput.addEventListener("blur", () => {
                    clampValue(lenInput);
                    updateOutput();
                });
            });

            document.getElementById("copyBtn").addEventListener("click", () => {
                navigator.clipboard.writeText(document.getElementById("output").textContent);
            });

            function updateAll(e) {
                updateMaxIndex(e.target.closest(".field"));
                updateOutput();
            }

            function clampValue(el) {
                const max = parseInt(el.getAttribute("max")) || 1;
                let v = parseInt(el.value);
                if (isNaN(v) || v < 1) v = 1;
                if (v > max) v = max;
                el.value = v;
            }

            function updateMaxIndex(field) {
                const id = field.querySelector(".note-input").value;
                const content = idMap[id];
                if (!content) return;

                const lenInput = field.querySelector(".len-input");
                const byteLength = new TextEncoder().encode(content).length;

                lenInput.setAttribute("max", byteLength);

                let v = parseInt(lenInput.value) || 1;
                if (v > byteLength) v = byteLength;
                lenInput.value = v;
            }

            function charAtByte(str, byteIndex) {
                const bytes = new TextEncoder().encode(str);
                if (byteIndex < 0 || byteIndex >= bytes.length) return "?";

                const partial = bytes.slice(0, byteIndex + 1);
                const text = new TextDecoder().decode(partial);
                return [...text].pop() || "?";
            }

            function updateOutput() {
                let result = "";

                document.querySelectorAll(".field").forEach(field => {
                    const id = field.querySelector(".note-input").value;
                    const idx = parseInt(field.querySelector(".len-input").value) - 1;

                    if (!idMap[id]) result += "?";
                    else result += charAtByte(idMap[id], idx);
                });

                document.getElementById("output").textContent = result;
            }
        });
});
