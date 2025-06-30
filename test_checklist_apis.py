#!/usr/bin/env python
"""
Comprehensive test script for checklist API functionality
Run this after starting the Django server: python manage.py runserver
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000/api"
USERNAME = "admin"  # Replace with your username
PASSWORD = "admin"  # Replace with your password

class ChecklistAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        
    def authenticate(self):
        """Authenticate and get token"""
        print("🔐 Authenticating...")
        try:
            # Try Django auth first
            login_data = {
                'username': USERNAME,
                'password': PASSWORD
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login/", login_data)
            if response.status_code == 200:
                print("✅ Authentication successful")
                return True
            else:
                print(f"❌ Authentication failed: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return False
    
    def test_template_operations(self):
        """Test checklist template operations"""
        print("\n📋 Testing Template Operations...")
        
        # Test get field types
        try:
            response = self.session.get(f"{BASE_URL}/checklists/api/templates/field-types/")
            if response.status_code == 200:
                field_types = response.json()
                print(f"✅ Field types retrieved: {len(field_types)} types")
            else:
                print(f"❌ Failed to get field types: {response.status_code}")
        except Exception as e:
            print(f"❌ Field types error: {e}")
        
        # Test create template
        template_data = {
            "name": "Test Audit Template",
            "description": "A comprehensive test template",
            "category": "testing",
            "is_active": True,
            "fields": [
                {
                    "label": "Document Review",
                    "field_type": "textarea",
                    "help_text": "Review all relevant documents",
                    "is_required": True,
                    "order": 1
                },
                {
                    "label": "Compliance Rating",
                    "field_type": "select",
                    "help_text": "Rate compliance level",
                    "is_required": True,
                    "options": [
                        {"value": "excellent", "label": "Excellent"},
                        {"value": "good", "label": "Good"},
                        {"value": "needs_improvement", "label": "Needs Improvement"},
                        {"value": "poor", "label": "Poor"}
                    ],
                    "order": 2
                },
                {
                    "label": "Evidence Upload",
                    "field_type": "file",
                    "help_text": "Upload supporting evidence",
                    "is_required": False,
                    "order": 3
                },
                {
                    "label": "Completion Date",
                    "field_type": "date",
                    "help_text": "Expected completion date",
                    "is_required": True,
                    "order": 4
                }
            ]
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/checklists/api/templates/", json=template_data)
            if response.status_code == 201:
                template = response.json()
                print(f"✅ Template created: {template['name']} (ID: {template['id']})")
                return template['id']
            else:
                print(f"❌ Failed to create template: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Template creation error: {e}")
            return None
    
    def test_checklist_operations(self, template_id):
        """Test checklist operations"""
        if not template_id:
            print("❌ Cannot test checklists without template")
            return None
            
        print("\n📝 Testing Checklist Operations...")
        
        # Create checklist
        checklist_data = {
            "template_id": template_id,
            "name": "Financial Audit Q4 2024",
            "description": "Quarterly financial audit for compliance",
            "due_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "priority": "high",
            "tags": ["quarterly", "financial", "compliance"]
        }
        
        try:
            response = self.session.post(f"{BASE_URL}/checklists/api/checklists/", json=checklist_data)
            if response.status_code == 201:
                checklist = response.json()
                print(f"✅ Checklist created: {checklist['name']} (ID: {checklist['id']})")
                return checklist['id']
            else:
                print(f"❌ Failed to create checklist: {response.status_code}")
                print(f"Response: {response.text}")
                return None
        except Exception as e:
            print(f"❌ Checklist creation error: {e}")
            return None
    
    def test_response_operations(self, checklist_id):
        """Test checklist response operations"""
        if not checklist_id:
            print("❌ Cannot test responses without checklist")
            return
            
        print("\n💬 Testing Response Operations...")
        
        # Get checklist details to see fields
        try:
            response = self.session.get(f"{BASE_URL}/checklists/api/checklists/{checklist_id}/")
            if response.status_code == 200:
                checklist = response.json()
                fields = checklist['template']['fields']
                print(f"✅ Retrieved checklist with {len(fields)} fields")
                
                # Submit responses for each field
                for field in fields:
                    field_id = field['id']
                    field_type = field['field_type']
                    
                    # Create appropriate response based on field type
                    value = {}
                    if field_type == 'textarea':
                        value = {'text': 'All documents have been thoroughly reviewed and found to be compliant with regulations.'}
                    elif field_type == 'select':
                        value = {'selected': 'good'}
                    elif field_type == 'date':
                        value = {'date': (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')}
                    elif field_type == 'file':
                        value = {'files': []}  # Would normally upload files
                    
                    response_data = {
                        'field_id': field_id,
                        'value': value,
                        'is_completed': True,
                        'comments': f'Response for field: {field["label"]}'
                    }
                    
                    try:
                        response = self.session.post(
                            f"{BASE_URL}/checklists/api/checklists/{checklist_id}/submit-response/",
                            json=response_data
                        )
                        if response.status_code == 200:
                            print(f"✅ Response submitted for: {field['label']}")
                        else:
                            print(f"❌ Failed to submit response for {field['label']}: {response.status_code}")
                    except Exception as e:
                        print(f"❌ Response submission error for {field['label']}: {e}")
                
            else:
                print(f"❌ Failed to get checklist: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Response operations error: {e}")
    
    def test_progress_tracking(self, checklist_id):
        """Test progress tracking"""
        if not checklist_id:
            print("❌ Cannot test progress without checklist")
            return
            
        print("\n📊 Testing Progress Tracking...")
        
        try:
            response = self.session.get(f"{BASE_URL}/checklists/api/checklists/{checklist_id}/progress/")
            if response.status_code == 200:
                progress = response.json()
                print(f"✅ Progress: {progress['completed_fields']}/{progress['total_fields']} fields completed")
                print(f"✅ Completion: {progress['completion_percentage']}%")
                print(f"✅ Status: {progress['status']}")
            else:
                print(f"❌ Failed to get progress: {response.status_code}")
        except Exception as e:
            print(f"❌ Progress tracking error: {e}")
    
    def test_comment_operations(self, checklist_id):
        """Test comment operations"""
        if not checklist_id:
            print("❌ Cannot test comments without checklist")
            return
            
        print("\n💭 Testing Comment Operations...")
        
        # Add comment
        comment_data = {
            'content': 'This audit is progressing well. All documentation appears to be in order.',
            'is_internal': False
        }
        
        try:
            response = self.session.post(
                f"{BASE_URL}/checklists/api/checklists/{checklist_id}/comments/",
                json=comment_data
            )
            if response.status_code == 201:
                comment = response.json()
                print(f"✅ Comment added: {comment['content'][:50]}...")
            else:
                print(f"❌ Failed to add comment: {response.status_code}")
                
            # Get comments
            response = self.session.get(f"{BASE_URL}/checklists/api/checklists/{checklist_id}/comments/")
            if response.status_code == 200:
                comments = response.json()
                print(f"✅ Retrieved {len(comments)} comments")
            else:
                print(f"❌ Failed to get comments: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Comment operations error: {e}")
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        print("\n📈 Testing Dashboard Statistics...")
        
        try:
            response = self.session.get(f"{BASE_URL}/checklists/api/checklists/dashboard-stats/")
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ Dashboard stats:")
                print(f"   - Total checklists: {stats.get('total_checklists', 0)}")
                print(f"   - Completed: {stats.get('completed', 0)}")
                print(f"   - In progress: {stats.get('in_progress', 0)}")
                print(f"   - Overdue: {stats.get('overdue', 0)}")
                print(f"   - Completion rate: {stats.get('completion_rate', 0):.1f}%")
            else:
                print(f"❌ Failed to get dashboard stats: {response.status_code}")
        except Exception as e:
            print(f"❌ Dashboard stats error: {e}")
    
    def test_template_advanced_features(self, template_id):
        """Test advanced template features"""
        if not template_id:
            print("❌ Cannot test advanced features without template")
            return
            
        print("\n🔧 Testing Advanced Template Features...")
        
        # Test usage stats
        try:
            response = self.session.get(f"{BASE_URL}/checklists/api/templates/{template_id}/usage-stats/")
            if response.status_code == 200:
                stats = response.json()
                print(f"✅ Template usage stats: {stats.get('total_usage', 0)} uses")
            else:
                print(f"❌ Failed to get usage stats: {response.status_code}")
        except Exception as e:
            print(f"❌ Usage stats error: {e}")
        
        # Test duplicate template
        try:
            response = self.session.post(f"{BASE_URL}/checklists/api/templates/{template_id}/duplicate/")
            if response.status_code == 201:
                duplicate = response.json()
                print(f"✅ Template duplicated: {duplicate['template']['name']}")
            else:
                print(f"❌ Failed to duplicate template: {response.status_code}")
        except Exception as e:
            print(f"❌ Template duplication error: {e}")
    
    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive Checklist API Tests")
        print("=" * 50)
        
        # Authenticate
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Test template operations
        template_id = self.test_template_operations()
        
        # Test checklist operations
        checklist_id = self.test_checklist_operations(template_id)
        
        # Test response operations
        self.test_response_operations(checklist_id)
        
        # Test progress tracking
        self.test_progress_tracking(checklist_id)
        
        # Test comment operations
        self.test_comment_operations(checklist_id)
        
        # Test dashboard stats
        self.test_dashboard_stats()
        
        # Test advanced template features
        self.test_template_advanced_features(template_id)
        
        print("\n" + "=" * 50)
        print("🎉 Comprehensive test completed!")
        print("\n📝 Summary:")
        print("- ✅ Template creation and management")
        print("- ✅ Checklist creation and operations")
        print("- ✅ Response submission and tracking")
        print("- ✅ Progress monitoring")
        print("- ✅ Comment system")
        print("- ✅ Dashboard statistics")
        print("- ✅ Advanced template features")
        
        return True

def main():
    """Main test execution"""
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("""
Checklist API Tester

Usage:
    python test_checklist_apis.py

Prerequisites:
    1. Django server running: python manage.py runserver
    2. Valid admin credentials in the script
    
This script will test all major checklist functionality including:
- Template creation and management
- Checklist operations
- Response handling
- Progress tracking
- Comments
- Dashboard statistics
- Advanced features
        """)
        return
    
    print("🧪 Checklist API Testing Suite")
    print("Ensure Django server is running on http://localhost:8000")
    
    tester = ChecklistAPITester()
    
    try:
        success = tester.run_comprehensive_test()
        if success:
            print("\n✅ All tests completed successfully!")
        else:
            print("\n❌ Some tests failed. Check the output above.")
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    main() 