from datetime import date
from django.test import TestCase, Client
from django.urls import reverse
from .models import Todo
from .forms import TodoForm


# ============================================================================
# Model Tests
# ============================================================================
class TodoModelTest(TestCase):
    """Tests for the Todo model"""

    def test_create_todo_with_title_only(self):
        """Test creating a todo with only the title field"""
        todo = Todo.objects.create(title="Buy groceries")
        self.assertEqual(todo.title, "Buy groceries")
        self.assertIsNone(todo.due_date)
        self.assertFalse(todo.is_resolved)

    def test_create_todo_with_all_fields(self):
        """Test creating a todo with all fields populated"""
        todo = Todo.objects.create(
            title="Complete project",
            due_date=date(2025, 12, 31),
            is_resolved=True
        )
        self.assertEqual(todo.title, "Complete project")
        self.assertEqual(todo.due_date, date(2025, 12, 31))
        self.assertTrue(todo.is_resolved)

    def test_str_returns_title(self):
        """Test that __str__ method returns the todo title"""
        todo = Todo.objects.create(title="Test todo item")
        self.assertEqual(str(todo), "Test todo item")

    def test_default_is_resolved_false(self):
        """Test that is_resolved defaults to False"""
        todo = Todo.objects.create(title="New task")
        self.assertFalse(todo.is_resolved)


# ============================================================================
# Form Tests
# ============================================================================
class TodoFormTest(TestCase):
    """Tests for the TodoForm"""

    def test_valid_form(self):
        """Test form with valid title is valid"""
        form = TodoForm(data={'title': 'Valid todo title'})
        self.assertTrue(form.is_valid())

    def test_invalid_form_empty_title(self):
        """Test form without title is invalid"""
        form = TodoForm(data={'title': ''})
        self.assertFalse(form.is_valid())
        self.assertIn('title', form.errors)

    def test_form_with_optional_due_date(self):
        """Test form accepts optional due_date"""
        # Without due_date
        form1 = TodoForm(data={'title': 'Todo without date'})
        self.assertTrue(form1.is_valid())

        # With due_date
        form2 = TodoForm(data={'title': 'Todo with date', 'due_date': '2025-12-31'})
        self.assertTrue(form2.is_valid())


# ============================================================================
# View Tests
# ============================================================================
class TodoViewTest(TestCase):
    """Tests for the Todo views"""

    def setUp(self):
        """Set up test client and sample todo"""
        self.client = Client()
        self.todo = Todo.objects.create(
            title="Test Todo",
            due_date=date(2025, 12, 15),
            is_resolved=False
        )

    def test_todo_list_view(self):
        """Test that list view returns 200 and uses correct template"""
        response = self.client.get(reverse('todo:todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/todo_list.html')
        self.assertContains(response, 'Test Todo')

    def test_todo_list_empty(self):
        """Test empty list shows appropriate message"""
        Todo.objects.all().delete()
        response = self.client.get(reverse('todo:todo_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'No todos yet')

    def test_todo_create_get(self):
        """Test GET request to create view shows form"""
        response = self.client.get(reverse('todo:todo_create'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/todo_form.html')
        self.assertContains(response, 'Create Todo')

    def test_todo_create_post(self):
        """Test POST request creates todo and redirects"""
        response = self.client.post(reverse('todo:todo_create'), {
            'title': 'New Todo Item',
            'due_date': '2025-12-20',
        })
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Todo.objects.filter(title='New Todo Item').exists())

    def test_todo_edit_get(self):
        """Test GET request to edit view shows form with existing data"""
        response = self.client.get(reverse('todo:todo_edit', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/todo_form.html')
        self.assertContains(response, 'Test Todo')

    def test_todo_edit_post(self):
        """Test POST request updates todo and redirects"""
        response = self.client.post(reverse('todo:todo_edit', args=[self.todo.pk]), {
            'title': 'Updated Todo',
            'due_date': '2025-12-25',
        })
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')

    def test_todo_delete_get(self):
        """Test GET request to delete view shows confirmation page"""
        response = self.client.get(reverse('todo:todo_delete', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'todo/todo_confirm_delete.html')
        self.assertContains(response, 'Test Todo')

    def test_todo_delete_post(self):
        """Test POST request deletes todo and redirects"""
        todo_pk = self.todo.pk
        response = self.client.post(reverse('todo:todo_delete', args=[todo_pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Todo.objects.filter(pk=todo_pk).exists())

    def test_todo_toggle_resolved(self):
        """Test toggle changes is_resolved status"""
        self.assertFalse(self.todo.is_resolved)

        # Toggle to resolved
        response = self.client.post(reverse('todo:todo_toggle_resolved', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertTrue(self.todo.is_resolved)

        # Toggle back to unresolved
        response = self.client.post(reverse('todo:todo_toggle_resolved', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertFalse(self.todo.is_resolved)
