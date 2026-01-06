"use strict";
exports.__esModule = true;
exports.useFallingText = exports.useGlobalAnimations = void 0;
// fe-chat/src/hooks/useAnimations.ts - NUOVO FILE
var react_1 = require("react");
var gsap_1 = require("gsap");
function useGlobalAnimations() {
    react_1.useEffect(function () {
        // ✨ Click Spark Effect Globale
        var handleClick = function (e) {
            // Crea spark container se non esiste
            var sparkContainer = document.getElementById('global-spark-container');
            if (!sparkContainer) {
                sparkContainer = document.createElement('div');
                sparkContainer.id = 'global-spark-container';
                sparkContainer.style.cssText = "\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          pointer-events: none;\n          z-index: 99999;\n        ";
                document.body.appendChild(sparkContainer);
            }
            // Crea spark principale
            var spark = document.createElement('div');
            spark.className = 'clickSpark';
            spark.style.left = e.clientX + "px";
            spark.style.top = e.clientY + "px";
            sparkContainer.appendChild(spark);
            gsap_1.gsap.to(spark, {
                scale: 3,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: function () { return spark.remove(); }
            });
            // Crea particelle
            var particleCount = 8;
            var _loop_1 = function (i) {
                var particle = document.createElement('div');
                particle.className = 'sparkParticle';
                particle.style.left = e.clientX + "px";
                particle.style.top = e.clientY + "px";
                sparkContainer.appendChild(particle);
                var angle = (Math.PI * 2 * i) / particleCount;
                var distance = 60 + Math.random() * 40;
                var x = Math.cos(angle) * distance;
                var y = Math.sin(angle) * distance;
                gsap_1.gsap.to(particle, {
                    x: x,
                    y: y,
                    opacity: 0,
                    scale: 0,
                    duration: 0.8,
                    ease: 'power2.out',
                    onComplete: function () { return particle.remove(); }
                });
            };
            for (var i = 0; i < particleCount; i++) {
                _loop_1(i);
            }
        };
        document.addEventListener('click', handleClick);
        return function () { return document.removeEventListener('click', handleClick); };
    }, []);
}
exports.useGlobalAnimations = useGlobalAnimations;
// ✨ Hook per animare testo falling
function useFallingText(ref) {
    react_1.useEffect(function () {
        if (!ref.current)
            return;
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node instanceof HTMLElement) {
                        var textElements = node.querySelectorAll('.message-text');
                        textElements.forEach(function (element) {
                            if (element.textContent) {
                                var text = element.textContent;
                                var chars = text.split('');
                                element.innerHTML = chars
                                    .map(function (char) {
                                    return "<span class=\"fallText\" style=\"opacity: 0;\">" + (char === ' ' ? '&nbsp;' : char) + "</span>";
                                })
                                    .join('');
                                var charElements = element.querySelectorAll('.fallText');
                                gsap_1.gsap.to(charElements, {
                                    opacity: 1,
                                    y: 0,
                                    rotationX: 0,
                                    duration: 0.6,
                                    stagger: 0.02,
                                    ease: 'back.out(1.7)'
                                });
                            }
                        });
                    }
                });
            });
        });
        observer.observe(ref.current, {
            childList: true,
            subtree: true
        });
        return function () { return observer.disconnect(); };
    }, [ref]);
}
exports.useFallingText = useFallingText;
