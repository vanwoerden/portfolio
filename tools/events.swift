// Prints calendar events as JSON: events <days-back> <days-forward>
import EventKit
import Foundation

let args = CommandLine.arguments
let back = args.count > 1 ? Int(args[1]) ?? 7 : 7
let fwd = args.count > 2 ? Int(args[2]) ?? 21 : 21

let store = EKEventStore()
let sem = DispatchSemaphore(value: 0)
var granted = false
store.requestFullAccessToEvents { ok, _ in granted = ok; sem.signal() }
sem.wait()
guard granted else {
    FileHandle.standardError.write("calendar access denied\n".data(using: .utf8)!)
    exit(2)
}

let cal = Calendar.current
let startOfToday = cal.startOfDay(for: Date())
let start = cal.date(byAdding: .day, value: -back, to: startOfToday)!
let end = cal.date(byAdding: .day, value: fwd + 1, to: startOfToday)!
let pred = store.predicateForEvents(withStart: start, end: end, calendars: nil)

let iso = ISO8601DateFormatter()
iso.timeZone = TimeZone.current
iso.formatOptions = [.withInternetDateTime]
let dayFmt = DateFormatter()
dayFmt.dateFormat = "yyyy-MM-dd"

var out: [[String: Any]] = []
for e in store.events(matching: pred) {
    let allDay = e.isAllDay
    // All-day events end at midnight of the following day; make `end` inclusive.
    var endDate = e.endDate!
    if allDay { endDate = cal.date(byAdding: .day, value: -1, to: endDate) ?? endDate }
    if endDate < e.startDate { endDate = e.startDate }
    out.append([
        "id": e.eventIdentifier ?? UUID().uuidString,
        "title": e.title ?? "(untitled)",
        "all_day": allDay,
        "start": allDay ? dayFmt.string(from: e.startDate) : iso.string(from: e.startDate),
        "end": allDay ? dayFmt.string(from: endDate) : iso.string(from: endDate),
        "calendar": e.calendar.title,
        "calendar_id": e.calendar.calendarIdentifier,
        "location": e.location ?? "",
    ])
}
let data = try JSONSerialization.data(withJSONObject: out, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
