# MealCrew

A US-focused group food delivery prototype inspired by neighborhood batch ordering: shared delivery, fixed pickup hubs, opt-in restaurants, and transparent checkout.

Live site: https://cocoyou123456789-sketch.github.io/delivery-/

## Preview

Start a local static server:

```bash
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Google Maps

After adding `GOOGLE_MAPS_API_KEY` in `app-config.js`, the page loads a live Google Map and uses the Places Library to search nearby real restaurants for group-order cards and combo menus.

Enable and restrict this browser key to:

- Maps JavaScript API
- Places API
- Geocoding API

For production, add HTTP referrer restrictions so only your real domain can use the key.

## Market Pain Points

The page turns US delivery-market pain points directly into product behavior:

- Opaque fees: group cards and checkout show all-in estimates, shared delivery, platform fees, and expected savings.
- Expensive solo orders: orders from the same building, campus, or block are batched to lower per-person delivery cost.
- Unreliable ETA: cutoff times, group progress, and fixed pickup hubs make fulfillment windows narrower.
- Pickup coordination: the Google Map area shows restaurants and pickup hubs.
- Restaurant margin pressure: opt-in menus and batch orders reduce fragmented fulfillment.
- Driver route inefficiency: multiple small orders are grouped into fewer pickup points for higher order density per mile.

## Validation Plan

The page includes a launch plan and local pilot intake form. Suggested next steps:

1. Pick one dense pilot zone: apartment building, dorm, lab building, or office.
2. Interview 20 high-frequency delivery users and test whether they will trade fixed pickup for lower fees.
3. Recruit 5 opt-in restaurants willing to prep batch combos.
4. Run a manual-dispatch MVP at 30-50 orders/day before building a backend.
5. Track group completion, repeat usage, late rate, refund reasons, and acceptable cutoff windows.
6. If the data works, add payments, an order database, restaurant tools, and driver routing.

## Included

- Live nearby group-order cards
- Google Map and Google Places integration path
- Market pain-point module
- Three-sided marketplace model
- Pilot launch plan and local intake form
- Transparent fee breakdown
- Working sort controls: fastest, nearest, lowest fee
- Group progress and order cutoff timers
- Combo menu and group cart
- Checkout drawer and demo order confirmation
- Pickup hub display
- Order status timeline
