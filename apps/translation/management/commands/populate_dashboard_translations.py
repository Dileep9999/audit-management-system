from django.core.management.base import BaseCommand
from apps.translation.models import Translation


class Command(BaseCommand):
    help = 'Populate dashboard translations for English and Arabic'

    def handle(self, *args, **options):
        # Dashboard translations
        translations = [
            # Main dashboard
            {
                'key': 'dashboard.title',
                'en': 'Audit Management Dashboard',
                'ar': 'لوحة إدارة التدقيق'
            },
            {
                'key': 'dashboard.description',
                'en': 'Monitor audit progress, track performance, and manage timelines',
                'ar': 'مراقبة تقدم التدقيق وتتبع الأداء وإدارة الجداول الزمنية'
            },
            
            # Date ranges
            {
                'key': 'dashboard.date_range.last_7_days',
                'en': 'Last 7 days',
                'ar': 'آخر 7 أيام'
            },
            {
                'key': 'dashboard.date_range.last_30_days',
                'en': 'Last 30 days',
                'ar': 'آخر 30 يوماً'
            },
            {
                'key': 'dashboard.date_range.last_90_days',
                'en': 'Last 90 days',
                'ar': 'آخر 90 يوماً'
            },
            {
                'key': 'dashboard.date_range.last_year',
                'en': 'Last year',
                'ar': 'العام الماضي'
            },
            
            # Tab navigation
            {
                'key': 'dashboard.tabs.overview',
                'en': 'Overview',
                'ar': 'نظرة عامة'
            },
            {
                'key': 'dashboard.tabs.gantt_chart',
                'en': 'Gantt Chart',
                'ar': 'مخطط جانت'
            },
            {
                'key': 'dashboard.tabs.analytics',
                'en': 'Analytics',
                'ar': 'التحليلات'
            },
            
            # Statistics cards
            {
                'key': 'dashboard.stats.total_audits',
                'en': 'Total Audits',
                'ar': 'إجمالي التدقيقات'
            },
            {
                'key': 'dashboard.stats.active_audits',
                'en': 'Active Audits',
                'ar': 'التدقيقات النشطة'
            },
            {
                'key': 'dashboard.stats.completed',
                'en': 'Completed',
                'ar': 'مكتمل'
            },
            {
                'key': 'dashboard.stats.teams',
                'en': 'Teams',
                'ar': 'الفرق'
            },
            
            # Chart titles
            {
                'key': 'dashboard.charts.audit_status_distribution',
                'en': 'Audit Status Distribution',
                'ar': 'توزيع حالة التدقيق'
            },
            {
                'key': 'dashboard.charts.audit_timeline',
                'en': 'Audit Timeline (30 Days)',
                'ar': 'الجدول الزمني للتدقيق (30 يوم)'
            },
            {
                'key': 'dashboard.charts.audit_types',
                'en': 'Audit Types',
                'ar': 'أنواع التدقيق'
            },
            {
                'key': 'dashboard.charts.team_performance',
                'en': 'Team Performance',
                'ar': 'أداء الفريق'
            },
            {
                'key': 'dashboard.charts.recent_activity',
                'en': 'Recent Activity',
                'ar': 'النشاط الأخير'
            },
            {
                'key': 'dashboard.charts.completion_trends',
                'en': 'Completion Trends',
                'ar': 'اتجاهات الإنجاز'
            },
            {
                'key': 'dashboard.charts.risk_assessment',
                'en': 'Risk Assessment',
                'ar': 'تقييم المخاطر'
            },
            {
                'key': 'dashboard.charts.performance_metrics',
                'en': 'Performance Metrics',
                'ar': 'مقاييس الأداء'
            },
            {
                'key': 'dashboard.charts.department_performance',
                'en': 'Department Performance',
                'ar': 'أداء القسم'
            },
            {
                'key': 'dashboard.charts.team_capacity_planning',
                'en': 'Team Capacity Planning',
                'ar': 'تخطيط سعة الفريق'
            },
            {
                'key': 'dashboard.charts.audit_findings_trends',
                'en': 'Audit Findings Trends (Last 6 Months)',
                'ar': 'اتجاهات نتائج التدقيق (آخر 6 أشهر)'
            },
            {
                'key': 'dashboard.charts.monthly_performance_overview',
                'en': 'Monthly Performance Overview',
                'ar': 'نظرة عامة على الأداء الشهري'
            },
            
            # Chart data labels
            {
                'key': 'dashboard.data.completed',
                'en': 'Completed',
                'ar': 'مكتمل'
            },
            {
                'key': 'dashboard.data.in_progress',
                'en': 'In Progress',
                'ar': 'قيد التنفيذ'
            },
            {
                'key': 'dashboard.data.review',
                'en': 'Review',
                'ar': 'مراجعة'
            },
            {
                'key': 'dashboard.data.draft',
                'en': 'Draft',
                'ar': 'مسودة'
            },
            {
                'key': 'dashboard.data.on_hold',
                'en': 'On Hold',
                'ar': 'معلق'
            },
            {
                'key': 'dashboard.data.overdue',
                'en': 'Overdue',
                'ar': 'متأخر'
            },
            {
                'key': 'dashboard.data.cancelled',
                'en': 'Cancelled',
                'ar': 'ملغى'
            },
            {
                'key': 'dashboard.data.archived',
                'en': 'Archived',
                'ar': 'مؤرشف'
            },
            
            # Audit types
            {
                'key': 'dashboard.audit_types.financial',
                'en': 'Financial',
                'ar': 'مالي'
            },
            {
                'key': 'dashboard.audit_types.compliance',
                'en': 'Compliance',
                'ar': 'الامتثال'
            },
            {
                'key': 'dashboard.audit_types.operational',
                'en': 'Operational',
                'ar': 'تشغيلي'
            },
            {
                'key': 'dashboard.audit_types.it_security',
                'en': 'IT Security',
                'ar': 'أمن تقنية المعلومات'
            },
            {
                'key': 'dashboard.audit_types.internal',
                'en': 'Internal',
                'ar': 'داخلي'
            },
            {
                'key': 'dashboard.audit_types.performance',
                'en': 'Performance',
                'ar': 'الأداء'
            },
            {
                'key': 'dashboard.audit_types.external',
                'en': 'External',
                'ar': 'خارجي'
            },
            {
                'key': 'dashboard.audit_types.risk_management',
                'en': 'Risk Management',
                'ar': 'إدارة المخاطر'
            },
            {
                'key': 'dashboard.audit_types.quality',
                'en': 'Quality',
                'ar': 'الجودة'
            },
            {
                'key': 'dashboard.audit_types.environmental',
                'en': 'Environmental',
                'ar': 'بيئي'
            },
            
            # Risk levels
            {
                'key': 'dashboard.risk.high_risk',
                'en': 'High Risk',
                'ar': 'مخاطر عالية'
            },
            {
                'key': 'dashboard.risk.medium_risk',
                'en': 'Medium Risk',
                'ar': 'مخاطر متوسطة'
            },
            {
                'key': 'dashboard.risk.low_risk',
                'en': 'Low Risk',
                'ar': 'مخاطر منخفضة'
            },
            
            # Performance metrics
            {
                'key': 'dashboard.metrics.success_rate',
                'en': 'Success Rate',
                'ar': 'معدل النجاح'
            },
            {
                'key': 'dashboard.metrics.active_audits',
                'en': 'Active Audits',
                'ar': 'التدقيقات النشطة'
            },
            {
                'key': 'dashboard.metrics.avg_hours',
                'en': 'Avg Hours',
                'ar': 'متوسط الساعات'
            },
            {
                'key': 'dashboard.metrics.active_teams',
                'en': 'Active Teams',
                'ar': 'الفرق النشطة'
            },
            
            # Departments
            {
                'key': 'dashboard.departments.finance',
                'en': 'Finance',
                'ar': 'المالية'
            },
            {
                'key': 'dashboard.departments.operations',
                'en': 'Operations',
                'ar': 'العمليات'
            },
            {
                'key': 'dashboard.departments.it',
                'en': 'IT',
                'ar': 'تقنية المعلومات'
            },
            {
                'key': 'dashboard.departments.hr',
                'en': 'HR',
                'ar': 'الموارد البشرية'
            },
            {
                'key': 'dashboard.departments.legal',
                'en': 'Legal',
                'ar': 'القانونية'
            },
            {
                'key': 'dashboard.departments.marketing',
                'en': 'Marketing',
                'ar': 'التسويق'
            },
            {
                'key': 'dashboard.departments.sales',
                'en': 'Sales',
                'ar': 'المبيعات'
            },
            {
                'key': 'dashboard.departments.rnd',
                'en': 'R&D',
                'ar': 'البحث والتطوير'
            },
        ]

        created_count = 0
        updated_count = 0

        for translation_data in translations:
            translation, created = Translation.objects.get_or_create(
                key=translation_data['key'],
                defaults={
                    'en': translation_data['en'],
                    'ar': translation_data['ar'],
                    'app': 'audit'
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created translation: {translation_data["key"]}')
                )
            else:
                # Update existing translation
                translation.en = translation_data['en']
                translation.ar = translation_data['ar']
                translation.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated translation: {translation_data["key"]}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nTranslation population completed!\n'
                f'Created: {created_count} translations\n'
                f'Updated: {updated_count} translations'
            )
        ) 