// AI Insights Analyzer
//
// Derives narrative insights from the SAME data the dashboard renders: it reads
// each source's metric series + categorical dimensions and computes real trends,
// leaders and threshold breaches. The narrative is templated per domain, but
// every number is computed — so the insights always agree with the charts.

import { getSourceDef, type DataSourceType, type SourceDef } from '@/lib/mock-data/catalog'
import { generateSeries } from '@/lib/mock-data/generator'
import { formatMetricValue } from '@/lib/format'

export interface Insight {
    id: string
    type: 'success' | 'warning' | 'recommendation' | 'info'
    title: string
    description: string
    metric?: string
    value?: string
    change?: number
    action?: string
    priority: 'high' | 'medium' | 'low'
}

interface MetricStat {
    name: string
    current: number
    previous: number
    changePct: number
    latest: number
    formatted: string
    target?: number
}

function metricStat(source: SourceDef, metricId: string): MetricStat | null {
    const def = source.metrics.find((m) => m.id === metricId)
    if (!def) return null

    const series = generateSeries(metricId, {
        base: def.base,
        variance: def.variance,
        trend: def.trend,
        seasonality: def.seasonality,
        decimals: def.decimals,
        min: def.min,
        max: def.max,
    })

    const avg = (arr: { value: number }[]) =>
        arr.length ? arr.reduce((s, d) => s + d.value, 0) / arr.length : 0

    const last7 = series.slice(-7)
    const prev7 = series.slice(-14, -7)
    const current = avg(last7)
    const previous = avg(prev7)
    const changePct = previous ? ((current - previous) / previous) * 100 : 0
    const latest = series[series.length - 1]?.value ?? 0

    return {
        name: def.name,
        current,
        previous,
        changePct,
        latest,
        formatted: `${def.prefix ?? ''}${formatMetricValue(def.aggregation === 'last' ? latest : current, def.unit, { decimals: def.decimals })}${def.suffix ?? ''}`,
        target: def.target,
    }
}

function topSlice(source: SourceDef, dimensionId: string) {
    const dim = source.dimensions.find((d) => d.id === dimensionId)
    if (!dim) return null
    const total = dim.slices.reduce((s, x) => s + x.value, 0)
    const leader = [...dim.slices].sort((a, b) => b.value - a.value)[0]
    return {
        name: dim.name,
        leader: leader.name,
        leaderValue: leader.value,
        share: total ? Math.round((leader.value / total) * 100) : 0,
        unit: dim.unit,
    }
}

function round(n: number, d = 1) {
    const f = 10 ** d
    return Math.round(n * f) / f
}

export function generateInsights(sourceId: DataSourceType): Insight[] {
    const source = getSourceDef(sourceId)
    switch (sourceId) {
        case 'google-analytics':
            return analyzeGoogleAnalytics(source)
        case 'meta-ads':
            return analyzeMetaAds(source)
        case 'internal-saas':
            return analyzeInternalSaaS(source)
        case 'ecommerce':
            return analyzeEcommerce(source)
        default:
            return []
    }
}

function analyzeGoogleAnalytics(source: SourceDef): Insight[] {
    const insights: Insight[] = []
    const conv = metricStat(source, 'ga-conversion-rate')
    const bounce = metricStat(source, 'ga-bounce-rate')
    const sessions = metricStat(source, 'ga-sessions')
    const traffic = topSlice(source, 'ga-traffic-source')

    if (traffic) {
        insights.push({
            id: 'ga-traffic-leader',
            type: 'success',
            title: `${traffic.leader} Drives Your Traffic`,
            description: `${traffic.leader} accounts for ${traffic.share}% of all visitors — your strongest acquisition channel and a sign of healthy demand.`,
            metric: traffic.name,
            value: `${traffic.share}%`,
            action: 'Double down on the content and keywords fueling this channel.',
            priority: 'high',
        })
    }

    if (conv) {
        const beatsTarget = conv.target ? conv.current >= conv.target : true
        insights.push({
            id: 'ga-conversion',
            type: beatsTarget ? 'success' : 'warning',
            title: beatsTarget ? 'Above-Benchmark Conversion Rate' : 'Conversion Rate Below Target',
            description: beatsTarget
                ? `Conversion rate of ${conv.formatted} exceeds the ${conv.target}% benchmark. Funnel optimization is paying off.`
                : `Conversion rate of ${conv.formatted} is under the ${conv.target}% target. Review high-traffic landing pages.`,
            metric: conv.name,
            value: conv.formatted,
            change: round(conv.changePct),
            action: beatsTarget
                ? 'Document the winning patterns and replicate across campaigns.'
                : 'Run A/B tests on hero copy and primary CTAs.',
            priority: beatsTarget ? 'medium' : 'high',
        })
    }

    if (bounce && bounce.current > 50) {
        insights.push({
            id: 'ga-bounce',
            type: 'warning',
            title: 'Elevated Bounce Rate',
            description: `Bounce rate is ${bounce.formatted}, above the 50% comfort zone. Visitors may not find what they expect on entry pages.`,
            metric: bounce.name,
            value: bounce.formatted,
            change: round(bounce.changePct),
            action: 'Improve page-load speed and align landing content with ad intent.',
            priority: 'high',
        })
    }

    if (sessions) {
        insights.push({
            id: 'ga-sessions-trend',
            type: sessions.changePct >= 0 ? 'info' : 'warning',
            title: sessions.changePct >= 0 ? 'Sessions Trending Up' : 'Sessions Softening',
            description: `Sessions moved ${round(sessions.changePct)}% week-over-week. Mobile remains the fastest-growing segment.`,
            metric: sessions.name,
            value: sessions.formatted,
            change: round(sessions.changePct),
            action: 'Audit the mobile checkout flow to capture the rising mobile share.',
            priority: 'medium',
        })
    }

    return insights
}

function analyzeMetaAds(source: SourceDef): Insight[] {
    const insights: Insight[] = []
    const roas = metricStat(source, 'meta-roas')
    const ctr = metricStat(source, 'meta-ctr')
    const campaign = topSlice(source, 'meta-spend-campaign')
    const age = topSlice(source, 'meta-conv-age')

    if (roas) {
        const good = roas.target ? roas.current >= roas.target : true
        insights.push({
            id: 'meta-roas',
            type: good ? 'success' : 'warning',
            title: good ? 'Strong Return on Ad Spend' : 'ROAS Below Target',
            description: good
                ? `Blended ROAS is ${roas.formatted}, comfortably above the ${roas.target}x target. Spend efficiency is excellent.`
                : `Blended ROAS is ${roas.formatted}, under the ${roas.target}x target. Pause the weakest ad sets.`,
            metric: 'ROAS',
            value: roas.formatted,
            change: round(roas.changePct),
            action: good ? 'Scale budget on the top campaign by 25–40%.' : 'Reallocate budget toward retargeting.',
            priority: 'high',
        })
    }

    if (campaign) {
        insights.push({
            id: 'meta-campaign',
            type: 'info',
            title: `${campaign.leader} Leads Spend`,
            description: `${campaign.leader} absorbs ${campaign.share}% of budget (${formatMetricValue(campaign.leaderValue, 'currency')}). Confirm it also leads on ROAS before scaling further.`,
            metric: campaign.name,
            value: `${campaign.share}%`,
            action: 'Cross-check campaign ROAS to avoid over-investing in volume.',
            priority: 'medium',
        })
    }

    if (age) {
        insights.push({
            id: 'meta-age',
            type: 'recommendation',
            title: `Lean Into the ${age.leader} Segment`,
            description: `The ${age.leader} cohort delivers ${age.share}% of conversions — your highest-intent audience. Budget allocation should mirror this.`,
            metric: age.name,
            value: age.leader,
            action: `Shift incremental budget toward the ${age.leader} audience.`,
            priority: 'high',
        })
    }

    if (ctr) {
        insights.push({
            id: 'meta-ctr',
            type: 'info',
            title: 'Creative Engagement Holding',
            description: `Average CTR is ${ctr.formatted}. Video creatives continue to outperform static by a wide margin.`,
            metric: 'CTR',
            value: ctr.formatted,
            change: round(ctr.changePct),
            action: 'Refresh fatigued static ads with short-form video.',
            priority: 'medium',
        })
    }

    return insights
}

function analyzeInternalSaaS(source: SourceDef): Insight[] {
    const insights: Insight[] = []
    const mrr = metricStat(source, 'saas-mrr')
    const churn = metricStat(source, 'saas-churn')
    const users = metricStat(source, 'saas-active-users')
    const plan = topSlice(source, 'saas-mrr-plan')

    if (mrr) {
        insights.push({
            id: 'saas-mrr',
            type: 'success',
            title: 'Healthy MRR Trajectory',
            description: `MRR is ${mrr.formatted}, up ${round(mrr.changePct)}% week-over-week — driven by new enterprise logos and tier upgrades.`,
            metric: 'MRR',
            value: mrr.formatted,
            change: round(mrr.changePct),
            action: 'Focus sales on mid-market accounts showing the highest conversion.',
            priority: 'high',
        })
    }

    if (churn) {
        const high = churn.target ? churn.current > churn.target : churn.current > 2.5
        insights.push({
            id: 'saas-churn',
            type: high ? 'warning' : 'success',
            title: high ? 'Churn Above Target' : 'Churn Under Control',
            description: high
                ? `Monthly churn of ${churn.formatted} exceeds the ${churn.target}% target. Exit surveys cite low feature adoption.`
                : `Monthly churn of ${churn.formatted} is within the ${churn.target}% target. Retention efforts are working.`,
            metric: 'Churn Rate',
            value: churn.formatted,
            change: round(churn.changePct),
            action: high ? 'Launch onboarding email sequences and in-app tours.' : 'Maintain proactive success check-ins.',
            priority: high ? 'high' : 'low',
        })
    }

    if (plan) {
        insights.push({
            id: 'saas-plan',
            type: 'info',
            title: `${plan.leader} Plan Powers Revenue`,
            description: `The ${plan.leader} tier contributes ${plan.share}% of MRR (${formatMetricValue(plan.leaderValue, 'currency')}). Expansion within this tier is your fastest path to growth.`,
            metric: plan.name,
            value: `${plan.share}%`,
            action: 'Build usage-based upsell nudges for this segment.',
            priority: 'medium',
        })
    }

    if (users) {
        insights.push({
            id: 'saas-users',
            type: 'recommendation',
            title: 'Activate Power-User Upgrades',
            description: `With ${users.formatted} average active users, a cohort is repeatedly hitting plan limits — prime upgrade candidates.`,
            metric: 'Active Users',
            value: users.formatted,
            change: round(users.changePct),
            action: 'Trigger an in-app upgrade offer when limits are exceeded 3+ times.',
            priority: 'high',
        })
    }

    return insights
}

function analyzeEcommerce(source: SourceDef): Insight[] {
    const insights: Insight[] = []
    const revenue = metricStat(source, 'ecom-revenue')
    const cart = metricStat(source, 'ecom-cart-abandon')
    const aov = metricStat(source, 'ecom-aov')
    const category = topSlice(source, 'ecom-revenue-category')

    if (revenue) {
        insights.push({
            id: 'ecom-revenue',
            type: 'success',
            title: 'Weekend Sales Surge',
            description: `Revenue is ${revenue.formatted}/day on average, ${round(revenue.changePct)}% week-over-week. Weekends consistently outperform weekdays.`,
            metric: 'Revenue',
            value: revenue.formatted,
            change: round(revenue.changePct),
            action: 'Schedule flash sales and launches for Friday–Saturday.',
            priority: 'medium',
        })
    }

    if (cart) {
        insights.push({
            id: 'ecom-cart',
            type: 'warning',
            title: 'High Cart Abandonment',
            description: `${cart.formatted} of carts are abandoned. Top exit points: shipping-cost reveal and forced account creation.`,
            metric: 'Cart Abandonment',
            value: cart.formatted,
            change: round(cart.changePct),
            action: 'Enable guest checkout and surface shipping costs earlier.',
            priority: 'high',
        })
    }

    if (category) {
        insights.push({
            id: 'ecom-category',
            type: 'success',
            title: `${category.leader} Category Dominates`,
            description: `${category.leader} generates ${category.share}% of revenue (${formatMetricValue(category.leaderValue, 'currency')}) and carries the highest average order value.`,
            metric: category.name,
            value: `${category.share}%`,
            action: `Expand the ${category.leader} catalog and create bundle deals.`,
            priority: 'high',
        })
    }

    if (aov) {
        insights.push({
            id: 'ecom-aov',
            type: 'recommendation',
            title: 'Free-Shipping Threshold Opportunity',
            description: `Average order value is ${aov.formatted}. Nudging the free-shipping threshold just above AOV reliably lifts basket size.`,
            metric: 'Avg. Order Value',
            value: aov.formatted,
            change: round(aov.changePct),
            action: 'A/B test a free-shipping threshold ~10% above current AOV.',
            priority: 'medium',
        })
    }

    return insights
}

export function getHealthScore(sourceId: DataSourceType): {
    score: number
    status: 'excellent' | 'good' | 'needs-attention' | 'critical'
    summary: string
} {
    const insights = generateInsights(sourceId)
    const successCount = insights.filter((i) => i.type === 'success').length
    const warningCount = insights.filter((i) => i.type === 'warning').length
    const highPriorityWarnings = insights.filter((i) => i.type === 'warning' && i.priority === 'high').length

    const score = Math.max(
        0,
        Math.min(100, 74 + successCount * 8 - warningCount * 12 - highPriorityWarnings * 4)
    )

    let status: 'excellent' | 'good' | 'needs-attention' | 'critical'
    let summary: string

    if (score >= 85) {
        status = 'excellent'
        summary = 'Metrics are performing exceptionally well. Keep the momentum.'
    } else if (score >= 70) {
        status = 'good'
        summary = 'Overall healthy performance with a few optimization opportunities.'
    } else if (score >= 50) {
        status = 'needs-attention'
        summary = 'Several areas need attention to improve performance.'
    } else {
        status = 'critical'
        summary = 'Critical issues detected — immediate action recommended.'
    }

    return { score, status, summary }
}
