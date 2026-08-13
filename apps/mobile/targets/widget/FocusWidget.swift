import WidgetKit
import SwiftUI

// MARK: - Data Models
struct QuoteData: Codable {
    let content: String
    let author: String
    let topicName: String?
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    let appGroupId = "group.com.mindset.focus.widget"

    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), quote: QuoteData(
            content: "Vous êtes plus fort que vous ne le pensez.",
            author: "Focus",
            topicName: nil
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let entry = pickEntry(for: Date())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> ()) {
        let now = Date()
        let calendar = Calendar.current

        // Build one entry for today and one for the next 6 days so the widget
        // shows a different quote each day even if the app is not opened.
        var entries: [QuoteEntry] = []
        for offset in 0..<7 {
            if let day = calendar.date(byAdding: .day, value: offset, to: calendar.startOfDay(for: now)) {
                entries.append(pickEntry(for: day))
            }
        }

        // Refresh at next midnight to roll the quote forward
        let nextMidnight = calendar.date(byAdding: .day, value: 1, to: calendar.startOfDay(for: now)) ?? now.addingTimeInterval(86400)
        let timeline = Timeline(entries: entries, policy: .after(nextMidnight))
        completion(timeline)
    }

    /// Pick a quote for a given date. Uses an array of quotes if available
    /// (key "quotesArray") otherwise falls back to a single "currentQuote".
    private func pickEntry(for date: Date) -> QuoteEntry {
        let defaults = UserDefaults(suiteName: appGroupId)

        // 1) Preferred: array of quotes
        if let quotes = readQuotesArray(from: defaults), !quotes.isEmpty {
            let dayIndex = dayOfEra(for: date)
            let index = abs(dayIndex) % quotes.count
            return QuoteEntry(date: date, quote: quotes[index])
        }

        // 2) Fallback: single quote stored as Data (binary JSON)
        if let data = defaults?.data(forKey: "currentQuote"),
           let quote = try? JSONDecoder().decode(QuoteData.self, from: data) {
            return QuoteEntry(date: date, quote: quote)
        }

        // 3) Fallback: single quote stored as String
        if let jsonString = defaults?.string(forKey: "currentQuote"),
           let data = jsonString.data(using: .utf8),
           let quote = try? JSONDecoder().decode(QuoteData.self, from: data) {
            return QuoteEntry(date: date, quote: quote)
        }

        // 4) Default placeholder
        return QuoteEntry(date: date, quote: QuoteData(
            content: "Ouvrez Focus pour découvrir une citation inspirante.",
            author: "Focus",
            topicName: nil
        ))
    }

    private func readQuotesArray(from defaults: UserDefaults?) -> [QuoteData]? {
        if let data = defaults?.data(forKey: "quotesArray"),
           let quotes = try? JSONDecoder().decode([QuoteData].self, from: data) {
            return quotes
        }
        if let jsonString = defaults?.string(forKey: "quotesArray"),
           let data = jsonString.data(using: .utf8),
           let quotes = try? JSONDecoder().decode([QuoteData].self, from: data) {
            return quotes
        }
        return nil
    }

    private func dayOfEra(for date: Date) -> Int {
        let calendar = Calendar.current
        let year = calendar.component(.year, from: date)
        let dayOfYear = calendar.ordinality(of: .day, in: .year, for: date) ?? 0
        return year * 366 + dayOfYear
    }
}

// MARK: - Timeline Entry
struct QuoteEntry: TimelineEntry {
    let date: Date
    let quote: QuoteData
}

// MARK: - Design

/// The app's accent, used the one way the design allows on a widget: as a
/// hairline around the card. `ContainerRelativeShape` follows the corner
/// radius the home screen gives the widget, so the stroke hugs the edge on
/// every device instead of drawing its own rounded rectangle inside it.
private struct AccentContour: View {
    var body: some View {
        ContainerRelativeShape()
            .strokeBorder(
                LinearGradient(
                    colors: [Color("gradientStart"), Color("gradientEnd")],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                ),
                lineWidth: 1.5
            )
    }
}

/// The Focus mark, tinted to sit quietly in a corner.
private struct FocusMark: View {
    var size: CGFloat
    var body: some View {
        Image("focusMark")
            .renderingMode(.template)
            .resizable()
            .scaledToFit()
            .frame(width: size, height: size)
            .foregroundStyle(Color("textSecondary"))
            .accessibilityHidden(true)
    }
}

/// The quote itself: centred, white, no opening mark and no pill. What the
/// design's preview shows, and nothing it does not.
private struct QuoteText: View {
    let text: String
    let size: CGFloat
    let lines: Int
    var body: some View {
        Text(text)
            .font(.system(size: size, weight: .medium))
            .foregroundStyle(Color("textPrimary"))
            .multilineTextAlignment(.center)
            .lineLimit(lines)
            .minimumScaleFactor(0.8)
    }
}

private struct AuthorText: View {
    let author: String
    let size: CGFloat
    var body: some View {
        Text(author)
            .font(.system(size: size, weight: .semibold))
            .foregroundStyle(Color("textSecondary"))
            .lineLimit(1)
    }
}

// MARK: - Widget Views
struct FocusWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall: SmallWidgetView(entry: entry)
        case .systemMedium: MediumWidgetView(entry: entry)
        case .systemLarge: LargeWidgetView(entry: entry)
        case .accessoryCircular: AccessoryCircularView(entry: entry)
        case .accessoryRectangular: AccessoryRectangularView(entry: entry)
        case .accessoryInline: AccessoryInlineView(entry: entry)
        default: MediumWidgetView(entry: entry)
        }
    }
}

/// Small: the quote alone. There is no room for an author line that does not
/// steal from the words, so the mark stands in for the signature.
struct SmallWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        VStack(spacing: 8) {
            Spacer(minLength: 0)
            QuoteText(text: entry.quote.content, size: 14, lines: 5)
            Spacer(minLength: 0)
            FocusMark(size: 14)
        }
        .padding(14)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(AccentContour())
        .containerBackground(for: .widget) { Color("$widgetBackground") }
    }
}

/// Medium: the home-screen widget. The quote centred, the author under it,
/// the mark in the corner — the composition of the design's widget preview.
struct MediumWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack(alignment: .topTrailing) {
            VStack(spacing: 8) {
                Spacer(minLength: 0)
                QuoteText(text: entry.quote.content, size: 16, lines: 4)
                AuthorText(author: entry.quote.author, size: 12)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)

            FocusMark(size: 16)
                .padding(12)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(AccentContour())
        .containerBackground(for: .widget) { Color("$widgetBackground") }
    }
}

/// Large: the same card with room to breathe, and the topic as a line of
/// context above the quote rather than a pill competing with it.
struct LargeWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack(alignment: .topTrailing) {
            VStack(spacing: 14) {
                Spacer(minLength: 0)
                if let topic = entry.quote.topicName, !topic.isEmpty {
                    Text(topic.uppercased())
                        .font(.system(size: 11, weight: .semibold))
                        .tracking(1.2)
                        .foregroundStyle(Color("textSecondary"))
                }
                QuoteText(text: entry.quote.content, size: 22, lines: 7)
                AuthorText(author: entry.quote.author, size: 14)
                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 24)
            .padding(.vertical, 20)

            FocusMark(size: 18)
                .padding(16)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .overlay(AccentContour())
        .containerBackground(for: .widget) { Color("$widgetBackground") }
    }
}

// MARK: - Lock screen

struct AccessoryCircularView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            Image("focusMark")
                .renderingMode(.template)
                .resizable()
                .scaledToFit()
                .padding(12)
        }
        .containerBackground(for: .widget) { Color.clear }
    }
}

struct AccessoryRectangularView: View {
    let entry: QuoteEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.quote.content).font(.caption).lineLimit(2)
            Text(entry.quote.author).font(.caption2).foregroundStyle(.secondary)
        }
        .containerBackground(for: .widget) { Color.clear }
    }
}

struct AccessoryInlineView: View {
    let entry: QuoteEntry
    var body: some View {
        Text(entry.quote.content)
            .containerBackground(for: .widget) { Color.clear }
    }
}

// MARK: - Widget Configuration
@main
struct FocusWidget: Widget {
    let kind: String = "FocusWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            FocusWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Focus")
        .description("Une citation, renouvelée chaque jour.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
        .contentMarginsDisabled()
    }
}
