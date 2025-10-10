# Проверим существование всех файлов
echo "=== Проверка файлов компонентов ==="
ls -la src/components/ProtectedRoute.js
ls -la src/components/vacation/VacationTimer.js
ls -la src/components/vacation/CaptureMoment.js
ls -la src/components/vacation/PlanSection.js
ls -la src/components/vacation/MemoriesSection.js
ls -la src/components/vacation/VacationManagement.js

echo "=== Проверка структуры директорий ==="
pwd
find src -name "*.js" | grep -E "(ProtectedRoute|VacationTimer|CaptureMoment|PlanSection|MemoriesSection|VacationManagement)" | head -10
