const Docker = require("dockerode")
const { exec } = require("child_process")
const util = require("util")

const execAsync = util.promisify(exec)

const docker = new Docker({ socketPath: "/var/run/docker.sock" })

//Postgres Detection Service
const postgresService = async () => {
    const databases = []

    try {
        //Step 1; Look for PostgreSQL docker containers
        const containers = await docker.listContainers({ all: true })

        const postgresContainers = containers.filter(container => container.Image.toLowerCase().includes("postgres"))

        postgresContainers.forEach(container => {
            databases.push({
                id: container.Id,
                engine: "PostgreSQL",
                source: "docker",
                status: container.State,
                container: container.Names[0].replace("/", ""),
                image: container.Image
            })
        })

        //Step 2: Look for POstgreSQL running on the host
        try {
            const { stdout } = await execAsync("pg_lsclusters")

            const lines = stdout
                .trim()
                .split("\n")
                .slice(1)

            lines.forEach(line => {
                const parts = line.trim().split(/\s+/)

                if (parts.length < 7) {
                    return
                }

                const [
                    version,
                    cluster,
                    port,
                    status,
                    owner,
                    dataDirectory,
                    logFile
                ] = parts

                databases.push({
                    id: `postgres-host-${version}-${cluster}`,
                    engine: "PostgreSQL",
                    source: "host",
                    status: status === "online"
                        ? "running"
                        : "stopped",
                    version,
                    cluster,
                    port: Number(port),
                    owner,
                    dataDirectory,
                    logFile
                })
            })

        } catch (error) {
            if (error.code === 127) {
                console.error(
                    "PostgreSQL host discovery failed: pg_lsclusters is not installed."
                )
            } else {
                console.error(
                    "PostgreSQL host discovery failed:",
                    error
                )
            }
        }

        return databases

    } catch (error) {
        console.error("PostgreSQL discovery error:", error)
        return []
    }
}

module.exports = postgresService