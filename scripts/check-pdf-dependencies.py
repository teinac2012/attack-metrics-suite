#!/usr/bin/env python3
"""
Script de verificación de dependencias para generación de informes PDF
"""

import sys

def check_dependencies():
    """Verifica que todas las dependencias estén instaladas"""
    missing = []
    
    dependencies = {
        'pandas': 'pandas',
        'matplotlib': 'matplotlib',
        'seaborn': 'seaborn',
        'numpy': 'numpy'
    }
    
    print("🔍 Verificando dependencias...\n")
    
    for package, import_name in dependencies.items():
        try:
            __import__(import_name)
            print(f"✅ {package} - Instalado")
        except ImportError:
            print(f"❌ {package} - NO ENCONTRADO")
            missing.append(package)
    
    print()
    
    if missing:
        print("⚠️  Dependencias faltantes detectadas:")
        print(f"   {', '.join(missing)}")
        print("\n📦 Para instalarlas, ejecuta:")
        print(f"   pip install {' '.join(missing)}")
        print("\n   O instala todas las dependencias:")
        print("   pip install -r requirements.txt")
        return False
    else:
        print("✅ Todas las dependencias están instaladas correctamente")
        return True

if __name__ == '__main__':
    success = check_dependencies()
    sys.exit(0 if success else 1)
