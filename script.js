class NeuralNetwork {
    constructor() {
        this.canvas = document.getElementById('networkCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationFrame = null;
        this.isAnimating = true;

        // Enhanced animation settings - keeping original values
        this.nodeCount = 20; // Moderate number of nodes
        this.connectionDistance = 220; // Distance for connections
        this.mouseInfluenceRadius = 180; // Mouse influence radius
        this.nodeMovementSpeed = 1.5; // Movement speed when influenced by mouse
        this.glowRadius = 50; // Glow radius
        this.naturalMovement = true; // Add natural movement
        this.movementSpeed = 0.3; // Natural movement speed
        this.nodeSizeMin = 4; // Minimum node size
        this.nodeSizeMax = 8; // Maximum node size

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('mousemove', (e) => this.updateMouse(e));
        
        // Create neural nodes with movement vectors
        for(let i = 0; i < this.nodeCount; i++) {
            this.nodes.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                baseSize: Math.random() * (this.nodeSizeMax - this.nodeSizeMin) + this.nodeSizeMin,
                // Add vectors for natural movement
                vx: (Math.random() - 0.5) * this.movementSpeed,
                vy: (Math.random() - 0.5) * this.movementSpeed
            });
        }

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Reposition nodes when canvas resizes
        this.nodes.forEach(node => {
            if (node.x > this.canvas.width) node.x = Math.random() * this.canvas.width;
            if (node.y > this.canvas.height) node.y = Math.random() * this.canvas.height;
        });
    }

    updateMouse(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    drawGlow(x, y, radius, intensity = 0.2) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(34, 211, 238, ${intensity})`);
        gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    animate() {
        if(!this.isAnimating) return;

        this.ctx.fillStyle = '#0A101F';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Update node positions with natural movement
        if (this.naturalMovement) {
            this.nodes.forEach(node => {
                // Move node based on its velocity
                node.x += node.vx;
                node.y += node.vy;
                
                // Boundary check and bounce
                if (node.x <= 0 || node.x >= this.canvas.width) {
                    node.vx = -node.vx;
                    node.x = Math.max(0, Math.min(this.canvas.width, node.x));
                }
                
                if (node.y <= 0 || node.y >= this.canvas.height) {
                    node.vy = -node.vy;
                    node.y = Math.max(0, Math.min(this.canvas.height, node.y));
                }
            });
        }

        // Draw connections between nodes
        this.nodes.forEach((node, i) => {
            this.nodes.forEach((other, j) => {
                if (i >= j) return; // Only draw connection once between each pair
                
                const dx = node.x - other.x;
                const dy = node.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    // Calculate opacity based on distance
                    const opacity = 0.2 * (1 - distance / this.connectionDistance);
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(34, 211, 238, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(node.x, node.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            });
        });

        // Draw nodes and handle mouse influence
        this.nodes.forEach(node => {
            // Check mouse influence
            const dx = node.x - this.mouse.x;
            const dy = node.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouseInfluenceRadius) {
                // Move away from mouse
                const push = (this.mouseInfluenceRadius - distance) / this.mouseInfluenceRadius;
                node.x += (dx / distance) * this.nodeMovementSpeed * push;
                node.y += (dy / distance) * this.nodeMovementSpeed * push;
                
                // Add glow effect
                this.drawGlow(node.x, node.y, this.glowRadius, 0.2 * push);
            }

            // Draw node with pulsing effect
            const time = Date.now() / 1000;
            const pulse = Math.sin(time + node.x * 0.01 + node.y * 0.01) * 0.2 + 0.8;
            const size = node.baseSize * pulse;
            
            this.ctx.fillStyle = '#22D3EE';
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    toggle() {
        this.isAnimating = !this.isAnimating;
        if (this.isAnimating) this.animate();
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize neural network
    const network = new NeuralNetwork();
    
    // Toggle animation button
    const animationToggle = document.querySelector('.animation-toggle');
    if (animationToggle) {
        animationToggle.addEventListener('click', () => network.toggle());
    }

    // YouTube video handling
    const videoContainer = document.querySelector('.video-container');
    const preview = document.getElementById('youtubePreview');
    const video = document.getElementById('demoVideo');
    
    if (videoContainer && preview && video) {
        videoContainer.addEventListener('click', () => {
            // Set YouTube src with autoplay parameter
            video.src = video.getAttribute('data-src');
            
            // Fade out preview
            preview.style.opacity = '0';
            
            // Remove preview after fade completes
            setTimeout(() => {
                preview.style.display = 'none';
            }, 300);
        });
    }
});
