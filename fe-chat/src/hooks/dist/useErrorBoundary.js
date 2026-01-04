"use strict";
exports.__esModule = true;
exports.useErrorBoundary = void 0;
var react_1 = require("react");
function useErrorBoundary() {
    var _a = react_1.useState({
        hasError: false,
        error: null,
        errorInfo: null
    }), errorState = _a[0], setErrorState = _a[1];
    var resetError = function () {
        setErrorState({ hasError: false, error: null, errorInfo: null });
    };
    var captureError = function (error, errorInfo) {
        console.error('🚨 Error captured:', error);
        console.error('📍 Error info:', errorInfo);
        setErrorState({
            hasError: true,
            error: error,
            errorInfo: errorInfo || error.message
        });
        // Log to external service in production
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error);
        }
    };
    return { errorState: errorState, captureError: captureError, resetError: resetError };
}
exports.useErrorBoundary = useErrorBoundary;
