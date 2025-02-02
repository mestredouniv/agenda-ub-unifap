export const cleanupOldAppointments = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Get all appointments
  const appointments = JSON.parse(localStorage.getItem("appointments") || "[]");
  
  // Filter appointments older than one year and save them to reports
  const oldAppointments = appointments.filter((app: any) => {
    const appDate = new Date(app.preferredDate);
    return appDate < oneYearAgo;
  });

  if (oldAppointments.length > 0) {
    // Save old appointments to reports storage
    const reports = JSON.parse(localStorage.getItem("historical-reports") || "[]");
    reports.push(...oldAppointments);
    localStorage.setItem("historical-reports", JSON.stringify(reports));

    // Keep only recent appointments
    const recentAppointments = appointments.filter((app: any) => {
      const appDate = new Date(app.preferredDate);
      return appDate >= oneYearAgo;
    });
    localStorage.setItem("appointments", JSON.stringify(recentAppointments));
  }
};

// Function to check and cleanup data (should be called on app startup)
export const initializeDataCleanup = () => {
  const lastCleanup = localStorage.getItem("last-cleanup-date");
  const now = new Date();
  
  if (!lastCleanup || new Date(lastCleanup) < new Date(now.getFullYear(), 0, 1)) {
    cleanupOldAppointments();
    localStorage.setItem("last-cleanup-date", now.toISOString());
  }
};
