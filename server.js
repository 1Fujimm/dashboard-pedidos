#!/usr/bin/env node
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ===== ARCHIVOS DE BASE DE DATOS =====
const usuariosFile = path.join(__dirname, 'usuarios.json');
const pedidosFile = path.join(__dirname, 'pedidos.json');

// Crear archivos si no existen
function inicializarArchivos() {
    if (!fs.existsSync(usuariosFile)) {
        const usuariosDefault = [
            { usuario: 'admin', password: 'admin', rol: 'admin' },
            { usuario: 'vendedor', password: 'vendedor', rol: 'vendedor' },
            { usuario: 'almacen', password: 'almacen', rol: 'almacen' }
        ];
        fs.writeFileSync(usuariosFile, JSON.stringify(usuariosDefault, null, 2));
    }
    if (!fs.existsSync(pedidosFile)) {
        fs.writeFileSync(pedidosFile, JSON.stringify([], null, 2));
    }
}

function leerUsuarios() {
    try {
        return JSON.parse(fs.readFileSync(usuariosFile, 'utf8'));
    } catch {
        return [];
    }
}

function leerPedidos() {
    try {
        return JSON.parse(fs.readFileSync(pedidosFile, 'utf8'));
    } catch {
        return [];
    }
}

function guardarUsuarios(datos) {
    fs.writeFileSync(usuariosFile, JSON.stringify(datos, null, 2));
}

function guardarPedidos(datos) {
    fs.writeFileSync(pedidosFile, JSON.stringify(datos, null, 2));
}

// ===== RUTAS =====

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { usuario, password } = req.body;
    const usuarios = leerUsuarios();
    const user = usuarios.find(u => u.usuario === usuario && u.password === password);
    
    if (user) {
        res.json({ success: true, usuario: user });
    } else {
        res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }
});

// GET USUARIOS
app.get('/api/usuarios', (req, res) => {
    const usuarios = leerUsuarios();
    res.json(usuarios);
});

// CREATE USUARIO
app.post('/api/usuarios', (req, res) => {
    const { usuario, password, rol } = req.body;
    const usuarios = leerUsuarios();
    
    if (usuarios.find(u => u.usuario === usuario)) {
        return res.status(400).json({ success: false, message: 'Usuario ya existe' });
    }
    
    usuarios.push({ usuario, password, rol });
    guardarUsuarios(usuarios);
    res.json({ success: true, usuario: { usuario, password, rol } });
});

// DELETE USUARIO
app.delete('/api/usuarios/:usuario', (req, res) => {
    const { usuario } = req.params;
    let usuarios = leerUsuarios();
    usuarios = usuarios.filter(u => u.usuario !== usuario);
    guardarUsuarios(usuarios);
    res.json({ success: true });
});

// GET PEDIDOS
app.get('/api/pedidos', (req, res) => {
    const pedidos = leerPedidos();
    res.json(pedidos);
});

// CREATE PEDIDO
app.post('/api/pedidos', (req, res) => {
    const pedido = req.body;
    const pedidos = leerPedidos();
    pedidos.push(pedido);
    guardarPedidos(pedidos);
    res.json({ success: true, pedido });
});

// UPDATE PEDIDO (cambiar estado)
app.put('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    let pedidos = leerPedidos();
    const pedido = pedidos.find(p => p.id == id);
    
    if (pedido) {
        pedido.estado = estado;
        guardarPedidos(pedidos);
        res.json({ success: true, pedido });
    } else {
        res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
});

// DELETE PEDIDO
app.delete('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    let pedidos = leerPedidos();
    pedidos = pedidos.filter(p => p.id != id);
    guardarPedidos(pedidos);
    res.json({ success: true });
});

// PATCH PEDIDO (editar completo)
app.patch('/api/pedidos/:id', (req, res) => {
    const { id } = req.params;
    const datosActualizados = req.body;
    let pedidos = leerPedidos();
    const index = pedidos.findIndex(p => p.id == id);
    
    if (index !== -1) {
        pedidos[index] = { ...pedidos[index], ...datosActualizados };
        guardarPedidos(pedidos);
        res.json({ success: true, pedido: pedidos[index] });
    } else {
        res.status(404).json({ success: false, message: 'Pedido no encontrado' });
    }
});

// ===== INICIAR SERVIDOR =====
inicializarArchivos();

app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
    console.log(`📊 Base de datos: usuarios.json y pedidos.json`);
});	