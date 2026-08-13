/* ========================================================================== */
/*  NATIVE BRIDGE — the only place the app touches the device (ADR-9).        */
/*                                                                            */
/*  Everything here is enhancement, never requirement: off native, and any     */
/*  time the platform says no, each function returns quietly and the app is    */
/*  exactly the app it was. Nothing is imported statically — native is         */
/*  detected through the global Capacitor injects, and plugins load lazily     */
/*  only once we know we are on a device, so neither the web bundle nor the    */
/*  single-file artifact carries a byte of Capacitor.                          */
/* ========================================================================== */

export const isNative = (): boolean => {
  try {
    const c = (window as any).Capacitor;
    return !!c && typeof c.isNativePlatform === "function" && c.isNativePlatform();
  } catch (e) {
    return false;
  }
};

/* Capacitor wants integer notification ids; habit ids are strings. A small
   stable hash keeps "one pending notification per habit" true across launches. */
export const notificationId = (habitId: string): number => {
  let h = 2166136261;
  for (let i = 0; i < habitId.length; i++) {
    h ^= habitId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 2000000000;
};

/* ------------------------------- haptics -------------------------------- */

/* Reserved for the two moments the app already marks with a chime: a focus
   timer closing, and the day being sealed. Sparse by policy — a buzz for
   anything ordinary would be exactly the dopamine mechanic we refuse. */
export async function haptic(weight: "light" | "medium" = "light"): Promise<void> {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: weight === "medium" ? ImpactStyle.Medium : ImpactStyle.Light });
  } catch (e) {
    /* a device without a taptic engine is not a problem to report */
  }
}

/* --------------------------- timer notifications ------------------------- */

/* iOS freezes JS timers the moment the app leaves the foreground, so a focus
   timer cannot ring itself from the background. The notification is therefore
   scheduled when the timer *starts* and cancelled if the timer is stopped,
   completed in the foreground, or abandoned by leaving the biosphere. */

export async function canNotify(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return true;
    if (current.display === "denied") return false;
    // asked for the first time only when a timer is actually started, so the
    // prompt arrives attached to something the user just chose to do
    const asked = await LocalNotifications.requestPermissions();
    return asked.display === "granted";
  } catch (e) {
    return false;
  }
}

export async function scheduleTimerEnd(habitId: string, habitName: string, at: Date): Promise<void> {
  if (!isNative()) return;
  if (at.getTime() <= Date.now()) return;
  try {
    if (!(await canNotify())) return;
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId(habitId),
          title: habitName,
          // the timer is an aid; it never claims the habit itself is done
          body: "your window has closed",
          schedule: { at: at, allowWhileIdle: true },
        },
      ],
    });
  } catch (e) {
    /* the in-app chime remains the primary signal */
  }
}

export async function cancelTimerEnd(habitId: string): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    await LocalNotifications.cancel({ notifications: [{ id: notificationId(habitId) }] });
  } catch (e) {
    /* nothing pending is the same outcome */
  }
}
