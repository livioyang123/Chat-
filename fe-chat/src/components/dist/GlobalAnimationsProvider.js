// fe-chat/src/components/GlobalAnimationsProvider.tsx - NUOVO
'use client';
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var gsap_1 = require("gsap");
function GlobalAnimationsProvider(_a) {
    var children = _a.children;
    react_1.useEffect(function () {
        // ✨ Click Spark Effect Globale
        var handleClick = function (e) {
            var sparkContainer = document.getElementById('global-spark-container');
            if (!sparkContainer) {
                sparkContainer = document.createElement('div');
                sparkContainer.id = 'global-spark-container';
                sparkContainer.style.cssText = "\n          position: fixed;\n          top: 0;\n          left: 0;\n          width: 100%;\n          height: 100%;\n          pointer-events: none;\n          z-index: 99999;\n        ";
                document.body.appendChild(sparkContainer);
            }
            // Spark principale
            var spark = document.createElement('div');
            spark.style.cssText = "\n        position: absolute;\n        width: 30px;\n        height: 30px;\n        border-radius: 50%;\n        background: radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%);\n        box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);\n        pointer-events: none;\n        left: " + e.clientX + "px;\n        top: " + e.clientY + "px;\n        transform: translate(-50%, -50%);\n      ";
            sparkContainer.appendChild(spark);
            gsap_1.gsap.to(spark, {
                scale: 3,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.out',
                onComplete: function () { return spark.remove(); }
            });
            // Particelle
            var particleCount = 8;
            var _loop_1 = function (i) {
                var particle = document.createElement('div');
                particle.style.cssText = "\n          position: absolute;\n          width: 6px;\n          height: 6px;\n          border-radius: 50%;\n          background: #6366f1;\n          box-shadow: 0 0 20px #6366f1;\n          pointer-events: none;\n          left: " + e.clientX + "px;\n          top: " + e.clientY + "px;\n          transform: translate(-50%, -50%);\n        ";
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
        return function () {
            document.removeEventListener('click', handleClick);
            var container = document.getElementById('global-spark-container');
            if (container)
                container.remove();
        };
    }, []);
    return React.createElement(React.Fragment, null, children);
}
exports["default"] = GlobalAnimationsProvider;
