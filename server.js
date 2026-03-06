const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Datos en memoria
let usuariosEnMemoria = [
    { id: 1, nombre: 'Administrador', usuario: 'admin', password: 'admin', rol: 'admin', sucursal: 'TODAS LAS TIENDAS' },
    { id: 2, nombre: 'Vendedor Demo', usuario: 'vendedor', password: 'vendedor', rol: 'vendedor', sucursal: 'Tienda Tacna' },
    { id: 3, nombre: 'Almacén Demo', usuario: 'almacen', password: 'almacen', rol: 'almacen', sucursal: 'TODAS LAS TIENDAS' }
];

let pedidosEnMemoria = [];

// USUARIOS
app.get('/api/usuarios', (req, res) => res.json(usuariosEnMemoria));

app.post('/api/usuarios', (req, res) => {
    const nuevoUsuario = {
        id: Math.max(...usuariosEnMemoria.map(u => u.id || 0)) + 1,
        ...req.body
    };
    if (usuariosEnMemoria.find(u => u.usuario === nuevoUsuario.usuario)) {
        return res.status(400).json({ error: 'Usuario ya existe' });
    }
    usuariosEnMemoria.push(nuevoUsuario);
    res.json(nuevoUsuario);
});

app.delete('/api/usuarios/:id', (req, res) => {
    usuariosEnMemoria = usuariosEnMemoria.filter(u => u.id !== parseInt(req.params.id));
    res.json({ success: true });
});

app.post('/api/usuarios/reset/default', (req, res) => {
    usuariosEnMemoria = [
        { id: 1, nombre: 'Administrador', usuario: 'admin', password: 'admin', rol: 'admin', sucursal: 'TODAS LAS TIENDAS' },
        { id: 2, nombre: 'Vendedor Demo', usuario: 'vendedor', password: 'vendedor', rol: 'vendedor', sucursal: 'Tienda Tacna' },
        { id: 3, nombre: 'Almacén Demo', usuario: 'almacen', password: 'almacen', rol: 'almacen', sucursal: 'TODAS LAS TIENDAS' }
    ];
    res.json({ success: true, usuarios: usuariosEnMemoria });
});

app.post('/api/login', (req, res) => {
    const usuario = usuariosEnMemoria.find(u => u.usuario === req.body.usuario && u.password === req.body.password);
    res.json(usuario ? { success: true, usuario } : { error: 'Credenciales incorrectas' });
});

// PEDIDOS
app.get('/api/pedidos', (req, res) => res.json(pedidosEnMemoria));

app.post('/api/pedidos', (req, res) => {
    const nuevoPedido = { ...req.body, id: Math.max(...pedidosEnMemoria.map(p => p.id || 0)) + 1 };
    pedidosEnMemoria.push(nuevoPedido);
    res.json(nuevoPedido);
});

app.delete('/api/pedidos/:id', (req, res) => {
    pedidosEnMemoria = pedidosEnMemoria.filter(p => p.id !== parseInt(req.params.id));
    res.json({ success: true });
});

app.patch('/api/pedidos/:id', (req, res) => {
    const index = pedidosEnMemoria.findIndex(p => p.id === parseInt(req.params.id));
    if (index !== -1) {
        pedidosEnMemoria[index] = { ...pedidosEnMemoria[index], ...req.body };
        res.json(pedidosEnMemoria[index]);
    } else {
        res.status(404).json({ error: 'Pedido no encontrado' });
    }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
    console.log(`👥 Usuarios: ${usuariosEnMemoria.length}`);
});
