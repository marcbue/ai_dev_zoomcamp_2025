from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.utils import timezone
from .models import Todo
from .forms import TodoForm


def todo_list(request):
    """Display all todos"""
    todos = Todo.objects.all().order_by('-id')
    today = timezone.now().date()
    return render(request, 'todo/todo_list.html', {'todos': todos, 'today': today})


def todo_create(request):
    """Create a new todo"""
    if request.method == 'POST':
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Todo created successfully!')
            return redirect('todo:todo_list')
    else:
        form = TodoForm()
    return render(request, 'todo/todo_form.html', {'form': form, 'title': 'Create Todo'})


def todo_edit(request, pk):
    """Edit an existing todo"""
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == 'POST':
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            messages.success(request, 'Todo updated successfully!')
            return redirect('todo:todo_list')
    else:
        form = TodoForm(instance=todo)
    return render(request, 'todo/todo_form.html', {'form': form, 'todo': todo, 'title': 'Edit Todo'})


def todo_delete(request, pk):
    """Delete a todo"""
    todo = get_object_or_404(Todo, pk=pk)
    if request.method == 'POST':
        todo.delete()
        messages.success(request, 'Todo deleted successfully!')
        return redirect('todo:todo_list')
    return render(request, 'todo/todo_confirm_delete.html', {'todo': todo})


def todo_toggle_resolved(request, pk):
    """Toggle the resolved status of a todo"""
    todo = get_object_or_404(Todo, pk=pk)
    todo.is_resolved = not todo.is_resolved
    todo.save()
    messages.success(request, f'Todo marked as {"resolved" if todo.is_resolved else "unresolved"}!')
    return redirect('todo:todo_list')
