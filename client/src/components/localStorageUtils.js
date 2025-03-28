export const preserveWidgetTemplatesAndClear = () => {
      // Save all widgetTemplate_ entries
      const widgetTemplates = {};
      Object.keys(localStorage)
        .filter((key) => key.startsWith("widgetTemplate_"))
        .forEach((key) => {
          widgetTemplates[key] = localStorage.getItem(key);
        });
    
      // Clear all localStorage
      localStorage.clear();
    
      // Restore widgetTemplate_ entries
      Object.keys(widgetTemplates).forEach((key) => {
        localStorage.setItem(key, widgetTemplates[key]);
      });
    };