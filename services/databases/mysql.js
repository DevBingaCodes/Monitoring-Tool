const Docker = require("dockerode")
const { exec } = require("child_process")
const util = require("util")

const execAsync = util.promisify(exec)

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

const mysqlService = async () => {
    const databases = []

    try {
        //Look for MySQL docker instances
        const containers = await docker.listContainers({ all: true })

        const mysqlContainers = containers.filter(container => container.Image.toLowerCase().includes("mysql:"))

        mysqlContainers.forEach(container => {
            databases.push({
                id: container.Id,
                engine: "MySQL",
                source: "docker",
                status: container.State,
                container: container.Names[0].replace("/", ""),
                image: container.Image
            })
        })

        //Look for running MySQL system services
        try {
            const { stdout } = await execAsync(
                "ss -lntp 2>/dev/null | grep ':3306 '"
            )

            if (stdout.trim()) {
                databases.push({
                    id: "mysql-host",
                    engine: "MySQL",
                    source: "host",
                    status: "running",
                    port: 3306
                })
            }
        } catch (error) {
            // grep exit code 1 means no process is listening
            // on port 5432. This is an expected result.
            if (error.code === 1) {
                // PostgreSQL host instance not detected.
            } else {
                console.error("PostgreSQL host discovery failed:", error)
            }
        }

        return databases
        
    } catch (error) {
        console.error("MySQL discovery error:", error)
        return []
    }
}

module.exports = mysqlService