
export function isDaytime() {
    const now = new Date();
    const hours = now.getHours();

    // Define the start and end hours for daytime (e.g., 6 AM to 6 PM)
    const startHour = 6;
    const endHour = 18;

    // Check if the current hour is within the defined daytime range
    return hours >= startHour && hours < endHour;
}