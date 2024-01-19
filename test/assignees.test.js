import axios from "axios";
import util from "./util";

describe("Assignees: API resources", () => {
    // shared variables to check for later on
    let sharedName = "";
    let sharedId = 0;

    test("create a valid assignee (201, id returned)", async () => {
        // generate a random assignee
        let assignee = util.generateAssignee();
        // save the name to the shared variable for later comparison
        sharedName = assignee.name;
        const res = await axios.post(`${util.apiBasePath}/assignees`, assignee);
        expect(res.status).toBe(201);
        // id is returned (number) and >= 0
        expect(Number.isInteger(res.data.id)).toBe(true);
        expect(res.data.id).toBeGreaterThanOrEqual(0);
        // save the id to the shared variable for later comparison
        sharedId = res.data.id || 0;
    });

    test("retrieve all assignees (check for the newly created one)", async () => {
        const list = (await axios.get(`${util.apiBasePath}/assignees`)).data;
        // response is an array
        expect(Array.isArray(list)).toBe(true);
        // length is greater than 0
        expect(list.length).toBeGreaterThanOrEqual(1);
        // created entity exists in there
        const entity = list.find((e) => e.id === sharedId);
        expect(entity).not.toBeUndefined();
        expect(entity.name).toBe(sharedName);
    });

    test("edit the created assignee (200) and retrieve it with the change", async () => {
        const newAssignee = util.generateAssignee();
        const res = await axios.put(
            `${util.apiBasePath}/assignees/${sharedId}`,
            newAssignee
        );
        expect(res.status).toBe(200);
        // retrieve and validate updated entity
        const updated = (
            await axios.get(`${util.apiBasePath}/assignees/${sharedId}`)
        ).data;
        expect(updated.name).toBe(newAssignee.name);
        expect(updated.prename).toBe(newAssignee.prename);
        expect(updated.email).toBe(newAssignee.email);
        expect(updated.id).toBe(sharedId);
    });

    test("delete the created assignee (200)", async () => {
        const res = await axios.delete(
            `${util.apiBasePath}/assignees/${sharedId}`
        );
        expect(res.status).toBe(200);
    });

    test("edit for non-existing assignee fails (404)", async () => {
        // PUT should fail with 404
        await expect(
            axios.put(
                `${util.apiBasePath}/assignees/${sharedId}`,
                util.generateAssignee()
            )
        ).rejects.toThrow("Request failed with status code 404");
    });

    test("delete for non-existing assignee fails (404)", async () => {
        // DELETE should fail with 404
        await expect(
            axios.delete(`${util.apiBasePath}/assignees/${sharedId}`)
        ).rejects.toThrow("Request failed with status code 404");
    });

    test("validation: assignee with empty prename fails (400)", async () => {
        let assignee = util.generateAssignee();
        assignee.prename = "";
        await expect(
            axios.post(`${util.apiBasePath}/assignees`, assignee)
        ).rejects.toThrow("Request failed with status code 400");
    });

    test("validation: assignee with empty name fails (400)", async () => {
        let assignee = util.generateAssignee();
        assignee.name = "";
        await expect(
            axios.post(`${util.apiBasePath}/assignees`, assignee)
        ).rejects.toThrow("Request failed with status code 400");
    });

    test("validation: assignee with empty email fails (400)", async () => {
        let assignee = util.generateAssignee();
        assignee.email = "";
        await expect(
            axios.post(`${util.apiBasePath}/assignees`, assignee)
        ).rejects.toThrow("Request failed with status code 400");
    });

    test("validation: assignee with valid non-uni email fails (400)", async () => {
        let assignee = util.generateAssignee();
        // generate a valid non-uni email
        assignee.email = util.generateEmail();
        await expect(
            axios.post(`${util.apiBasePath}/assignees`, assignee)
        ).rejects.toThrow("Request failed with status code 400");
    });

    test("validation: assignee with invalid uni email fails (400)", async () => {
        let assignee = util.generateAssignee();
        assignee.email = "@iste.uni-stuttgart.de";
        await expect(
            axios.post(`${util.apiBasePath}/assignees`, assignee)
        ).rejects.toThrow("Request failed with status code 400");
    });
});
