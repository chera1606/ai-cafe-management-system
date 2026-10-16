# Kitchen Display System (KDS) & Barista Queue Guide

## Overview

The Kitchen Display System (KDS) provides real-time digital ticket management for cafe kitchen and barista operations (`FR-KDS-001` through `FR-KDS-007`).

---

## Access Points

- **All Stations Master Board**: `http://localhost:3001/kitchen`
- **Barista Station Route**: `http://localhost:3001/barista`
- **Top Navbar Link**: "Kitchen KDS" located in the main navigation

---

## Station Routing (FR-KDS-001, FR-KDS-002)

| Station Tab | Routing Logic | Typical Items |
| :--- | :--- | :--- |
| **All Stations** | Shows all incoming, in-prep, and ready orders | Full ticket visibility |
| **Barista** | Highlights orders containing beverage items | Ceremonial Yirgacheffe Pour-Over, Jebena Buna, Pistachio Highland Honey Latte, Spanish Latte, Cold Brew, Layered Spris Juice, Spiced Chai |
| **Kitchen** | Highlights orders containing food and bakery items | Special Doro Wot, Sizzling Beef Tibs, Chechebsa, Foul Mudammas, Vegan Beyaynetu, Croissant, Brioche, Tiramisu, Baklava |

---

## 3-Column Kanban Workflow (FR-KDS-003, FR-KDS-004)

```
[ New & Queued ] ──────> [ In Preparation ] ──────> [ Ready for Service ] ──────> [ Fulfilled ]
(PENDING / CONFIRMED)          (PREPARING)                  (READY)                  (COMPLETED)
```

1. **New & Queued**: Newly placed orders appear at top of queue. Click **Accept Order** $\to$ **Start Prep**.
2. **In Preparation**: Active cooking / brewing. Staff can cross off individual items as prepared via interactive checkboxes. Click **Mark Ready**.
3. **Ready for Service**: Items ready for customer pickup or table runner. Click **Order Picked Up** to finalize.

---

## Preparation Timer & SLA Thresholds (FR-KDS-004)

- **Normal ($< 8$ mins)**: Green emerald badge.
- **Warning ($8 - 15$ mins)**: Amber badge.
- **Overdue / Rush ($> 15$ mins)**: Rose red pulsing badge with `RUSH` indicator.

---

## Real-Time Features (FR-KDS-005, FR-KDS-007)

- **5-Second Heartbeat Polling**: Orders automatically synchronize every 5 seconds without manual page refreshes.
- **Synthesized Arrival Chime**: Web Audio API dual-tone chime (587Hz $\to$ 880Hz) rings when a new order arrives (with mute toggle).
- **Wall Mount / Kiosk Mode**: Fullscreen toggle button for dedicated kitchen tablets or monitors.
- **Live Workload Bar**: Real-time counters displaying Active Orders, Prep Count, Ready Count, and Average Preparation Time.
