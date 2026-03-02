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
    let appGroupId = "group.com.focus.quotes.widget"
    
    func placeholder(in context: Context) -> QuoteEntry {
        QuoteEntry(date: Date(), quote: QuoteData(
            content: "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
            author: "Steve Jobs",
            topicName: "Motivation"
        ))
    }

    func getSnapshot(in context: Context, completion: @escaping (QuoteEntry) -> ()) {
        let entry = getEntryFromStorage()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuoteEntry>) -> ()) {
        let entry = getEntryFromStorage()
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    private func getEntryFromStorage() -> QuoteEntry {
        let defaults = UserDefaults(suiteName: appGroupId)
        if let data = defaults?.data(forKey: "currentQuote"),
           let quote = try? JSONDecoder().decode(QuoteData.self, from: data) {
            return QuoteEntry(date: Date(), quote: quote)
        }
        return QuoteEntry(date: Date(), quote: QuoteData(
            content: "Ouvrez l'app Focus pour découvrir une citation inspirante.",
            author: "Focus",
            topicName: nil
        ))
    }
}

// MARK: - Timeline Entry
struct QuoteEntry: TimelineEntry {
    let date: Date
    let quote: QuoteData
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

struct SmallWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color("gradientStart"), Color("gradientEnd")], startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(alignment: .leading, spacing: 8) {
                Image(systemName: "quote.opening").font(.title3).foregroundColor(.white.opacity(0.8))
                Text(entry.quote.content).font(.system(size: 12, weight: .medium)).foregroundColor(.white).lineLimit(4)
                Spacer()
                Text("— \(entry.quote.author)").font(.system(size: 10, weight: .semibold)).foregroundColor(.white.opacity(0.9))
            }.padding(12)
        }.containerBackground(for: .widget) { Color.clear }
    }
}

struct MediumWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color("gradientStart"), Color("gradientEnd")], startPoint: .topLeading, endPoint: .bottomTrailing)
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Image(systemName: "quote.opening").font(.title2).foregroundColor(.white.opacity(0.8))
                        if let topic = entry.quote.topicName {
                            Text(topic).font(.caption).fontWeight(.semibold).foregroundColor(.white.opacity(0.7))
                                .padding(.horizontal, 8).padding(.vertical, 4).background(.white.opacity(0.2)).cornerRadius(8)
                        }
                    }
                    Text(entry.quote.content).font(.system(size: 14, weight: .medium)).foregroundColor(.white).lineLimit(3)
                    Spacer()
                    Text("— \(entry.quote.author)").font(.system(size: 12, weight: .semibold)).foregroundColor(.white.opacity(0.9))
                }.padding(16)
                Spacer()
            }
        }.containerBackground(for: .widget) { Color.clear }
    }
}

struct LargeWidgetView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color("gradientStart"), Color("gradientEnd")], startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Image(systemName: "quote.opening").font(.largeTitle).foregroundColor(.white.opacity(0.8))
                    Spacer()
                    if let topic = entry.quote.topicName {
                        Text(topic).font(.subheadline).fontWeight(.semibold).foregroundColor(.white.opacity(0.8))
                            .padding(.horizontal, 12).padding(.vertical, 6).background(.white.opacity(0.2)).cornerRadius(12)
                    }
                }
                Text(entry.quote.content).font(.system(size: 20, weight: .medium)).foregroundColor(.white)
                Spacer()
                HStack {
                    Text("— \(entry.quote.author)").font(.system(size: 16, weight: .semibold)).foregroundColor(.white.opacity(0.9))
                    Spacer()
                }
            }.padding(20)
        }.containerBackground(for: .widget) { Color.clear }
    }
}

struct AccessoryCircularView: View {
    let entry: QuoteEntry
    var body: some View {
        ZStack { AccessoryWidgetBackground(); Image(systemName: "quote.bubble.fill").font(.title2) }
    }
}

struct AccessoryRectangularView: View {
    let entry: QuoteEntry
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(entry.quote.content).font(.caption).lineLimit(2)
            Text("— \(entry.quote.author)").font(.caption2).foregroundStyle(.secondary)
        }
    }
}

struct AccessoryInlineView: View {
    let entry: QuoteEntry
    var body: some View { Text("\(entry.quote.author): \(entry.quote.content)") }
}

// MARK: - Widget Configuration
@main
struct FocusWidget: Widget {
    let kind: String = "FocusWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            FocusWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Focus Quote")
        .description("Affiche une citation inspirante.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

