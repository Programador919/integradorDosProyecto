
document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault()
        const email = document.querySelector("#email").value
        const password = document.querySelector("#password").value

        try {
            const response = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({email, password}),
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(response.ok){
            const data = await response.json()
            localStorage.setItem("token", data.token)

            if(data.token && data.user.rol === 'admin') {
            }
            }else if(data.token && data.user.rol === 'usuario') {
                console.log('Redirigiendo a /current');
                window.location.href = '/current';
        }else{
            console.error("Error en el inicio de sesion")
        }
        } catch (error) {
            console.error("Error en la solicitud", error)
        }
        
        
    })
