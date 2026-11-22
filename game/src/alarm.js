// Midnight Vault — the alarm meter: the one number the whole heist hangs on.
// One file, one job: alarm value, stages and what each stage does to the room.
export function createAlarm() {
  const alarm = {
    value: 0, // 0..100

    add(amount) {
      this.value = Math.max(0, Math.min(100, this.value + amount));
    },

    // CALM under 35, SUSPICIOUS to 70, HUNT above it. Guards hurry as it climbs.
    stage() {
      if (this.value >= 70) return 'HUNT';
      if (this.value >= 35) return 'SUSPICIOUS';
      return 'CALM';
    },

    // Guards patrol faster as the alarm climbs — the room itself turns against the thief.
    speedMult() {
      if (this.value >= 70) return 1.3;
      if (this.value >= 35) return 1.15;
      return 1;
    },

    update(dt, anyoneSees) {
      if (!anyoneSees) {
        // The room calms down only while nobody is looking at the thief.
        this.value = Math.max(0, this.value - 1.6 * dt);
      }
    },

    tripped() {
      return this.value >= 100;
    },
  };
  return alarm;
}
