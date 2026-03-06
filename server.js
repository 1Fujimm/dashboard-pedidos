const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ===== CORS SIMPLE =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Archivos de datos
const USUARIOS_FILE = 'usuarios.json';
const PEDIDOS_FILE = 'pedidos.json';

// Inicializar archivos si no existen
function inicializar() {
    if (!fs.existsSync(USUARIOS_FILE)) {
        const usuariosDefault = [
            { id: 1, nombre: 'Administrador', usuario: 'admin', password: 'admin', rol: 'admin', sucursal: 'TODAS LAS TIENDAS' },
            { id: 2, nombre: 'Vendedor Demo', usuario: 'vendedor', password: 'vendedor', rol: 'vendedor', sucursal: 'Tienda Tacna' },
            { id: 3, nombre: 'Almacén Demo', usuario: 'almacen', password: 'almacen', rol: 'almacen', sucursal: 'TODAS LAS TIENDAS' }
        ];
        fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuariosDefault, null, 2));
    }
    
    if (!fs.existsSync(PEDIDOS_FILE)) {
        fs.writeFileSync(PEDIDOS_FILE, JSON.stringify([], null, 2));
    }
}

inicializar();

// ========== USUARIOS ==========

// Obtener todos los usuarios
app.get('/api/usuarios', (req, res) => {
    try {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_FILE));
        res.json(usuarios);
    } catch (e) {
        res.status(500).json({ error: 'Error al leer usuarios' });
    }
});

// Crear usuario
app.post('/api/usuarios', (req, res) => {
    try {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_FILE));
        const nuevoUsuario = {
            id: Math.max(...usuarios.map(u => u.id || 0)) + 1,
            ...req.body
        };
        
        if (usuarios.find(u => u.usuario === nuevoUsuario.usuario)) {
            return res.status(400).json({ error: 'Usuario ya existe' });
        }
        
        usuarios.push(nuevoUsuario);
        fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
        res.json(nuevoUsuario);
    } catch (e) {
        res.status(500).json({ error: 'Error al crear usuario' });
    }
});

// Eliminar usuario
app.delete('/api/usuarios/:id', (req, res) => {
    try {
        let usuarios = JSON.parse(fs.readFileSync(USUARIOS_FILE));
        const usuarioAnterior = usuarios.length;
        usuarios = usuarios.filter(u => u.id !== parseInt(req.params.id));
        fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuarios, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Error al eliminar usuario' });
    }
});

// RESETEAR usuarios a los defaults (solo para desarrollo)
app.post('/api/usuarios/reset/default', (req, res) => {
    try {
        const usuariosDefault = [
            { id: 1, nombre: 'Administrador', usuario: 'admin', password: 'admin', rol: 'admin', sucursal: 'TODAS LAS TIENDAS' },
            { id: 2, nombre: 'Vendedor Demo', usuario: 'vendedor', password: 'vendedor', rol: 'vendedor', sucursal: 'Tienda Tacna' },
            { id: 3, nombre: 'Almacén Demo', usuario: 'almacen', password: 'almacen', rol: 'almacen', sucursal: 'TODAS LAS TIENDAS' }
        ];
        fs.writeFileSync(USUARIOS_FILE, JSON.stringify(usuariosDefault, null, 2));
        res.json({ success: true, usuarios: usuariosDefault });
    } catch (e) {
        res.status(500).json({ error: 'Error al resetear usuarios' });
    }
});

// Login
app.post('/api/login', (req, res) => {
    try {
        const usuarios = JSON.parse(fs.readFileSync(USUARIOS_FILE));
        const usuario = usuarios.find(u => 
            u.usuario === req.body.usuario && 
            u.password === req.body.password
        );
        
        if (usuario) {
            res.json({ success: true, usuario });
        } else {
            res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error al verificar usuario' });
    }
});

// ========== PEDIDOS ==========

// Obtener todos los pedidos
app.get('/api/pedidos', (req, res) => {
    try {
        const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
        res.json(pedidos);
    } catch (e) {
        res.status(500).json({ error: 'Error al leer pedidos' });
    }
});

// Crear pedido
app.post('/api/pedidos', (req, res) => {
    try {
        const pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
        const nuevoPedido = req.body;
        pedidos.push(nuevoPedido);
        fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
        res.json({ success: true, pedido: nuevoPedido });
    } catch (e) {
        res.status(500).json({ error: 'Error al crear pedido' });
    }
});

// Actualizar estado del pedido
app.put('/api/pedidos/:id', (req, res) => {
    try {
        let pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
        const pedido = pedidos.find(p => p.id === parseInt(req.params.id));
        
        if (pedido) {
            pedido.estado = req.body.estado;
            fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
            res.json({ success: true, pedido });
        } else {
            res.status(404).json({ error: 'Pedido no encontrado' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
});

// Eliminar pedido
app.delete('/api/pedidos/:id', (req, res) => {
    try {
        let pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
        pedidos = pedidos.filter(p => p.id !== parseInt(req.params.id));
        fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Error al eliminar pedido' });
    }
});

// Actualizar pedido completo (para edición)
app.patch('/api/pedidos/:id', (req, res) => {
    try {
        let pedidos = JSON.parse(fs.readFileSync(PEDIDOS_FILE));
        const index = pedidos.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index !== -1) {
            pedidos[index] = { ...pedidos[index], ...req.body };
            fs.writeFileSync(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2));
            res.json({ success: true, pedido: pedidos[index] });
        } else {
            res.status(404).json({ error: 'Pedido no encontrado' });
        }
    } catch (e) {
        res.status(500).json({ error: 'Error al actualizar pedido' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`📊 Base de datos: ${USUARIOS_FILE} y ${PEDIDOS_FILE}`);
});
